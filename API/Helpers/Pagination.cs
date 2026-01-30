using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

public class Pagination
{
  public static async Task<PaginatorResult<T>> CreateAsync<T>(IQueryable<T> query, int pageNumber, int pageSize)
  {
    var count = await query.CountAsync();
    var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
    return new PaginatorResult<T>
    {
      Metadata = new PaginationMetadata
      {
        CurrentPage = pageNumber,
        TotalCount = count,
        PageSize = pageSize,
        TotalPages = (int)Math.Ceiling(count / (double)pageSize)
      },
      Items = items
    };
  }
}

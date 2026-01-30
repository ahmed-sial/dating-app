namespace API.Helpers;

public class PaginatorResult<T>
{
  public PaginationMetadata Metadata { get; set; } = default!;
  public List<T> Items { get; set; } = [];
}


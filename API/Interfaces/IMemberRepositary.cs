using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMemberRepositary
{
    void Update(Member member);
    Task<bool> SaveAllAsync();
    Task<PaginatorResult<Member>> GetMembersAsync(MemberParams memberParams);
    Task<Member?> GetMemberByIdAsync(string Id);
    Task<IReadOnlyList<Photo>> GetPhotosForMemberAsync(string memberId);
    Task<Member?> GetMemberForUpdate(string id);

}

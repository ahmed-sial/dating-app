using API.Entities;

namespace API.Interfaces;

public interface ILikesRepository
{
  Task<MemberLikes?> GetMemberLike(string sourceMemberId, string targetMemberId);
  Task<IReadOnlyList<Member>> GetMemberLikes(string predicate, string memberId);
  Task<IReadOnlyList<string>> GetCurrentMemberLikeIds(string memberId);
  void DeleteLike(MemberLikes like);
  void AddLike(MemberLikes like);
  Task<bool> SaveAllChanges();
}

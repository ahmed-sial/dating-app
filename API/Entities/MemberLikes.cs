using System;

namespace API.Entities;

public class MemberLikes
{
  public required string SourceMemberId { get; set; }
  public Member SourceMember { get; set; } = null!;
  public required string TargetMemberId { get; set; }
  public Member TargetMember { get; set; } = null!;
}

using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Entities;

public class Member
{
    public string Id { get; set; } = null!;
    public required string DisplayName { get; set; }
    public required string Gender { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastActive { get; set; }
    public required string City { get; set; }
    public required string Country { get; set; }

    // Navigation Properties
    [JsonIgnore]
    public List<Photo> Photos { get; set; } = [];
    [JsonIgnore]
    public List<MemberLikes> LikedByMembers { get; set; } = [];
    [JsonIgnore]
    public List<MemberLikes> LikedMembers { get; set; } = [];

    [JsonIgnore]
    public List<Message> MessagesSent {get; set;} = [];

    [JsonIgnore]
    public List<Message> MessagesReceived {get; set;} = [];

    [JsonIgnore]
    [ForeignKey(nameof(Id))]
    public AppUser User { get; set; } = null!;
}

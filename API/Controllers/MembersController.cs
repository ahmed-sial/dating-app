using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MembersController(IMemberRepositary _memberRepositary, IPhotoService _photoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers([FromQuery] MemberParams memberParams)
    {
        memberParams.CurrentMemberId = User.GetMemberId();
        return Ok(await _memberRepositary.GetMembersAsync(memberParams));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Member>> GetMember(string id)
    {
        var user = await _memberRepositary.GetMemberByIdAsync(id);
        if (user == null) return NotFound();
        return user;
    }

    [HttpGet("{id}/photos")]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetMemberPhotos(string id)
    {
        return Ok(await _memberRepositary.GetPhotosForMemberAsync(id));
    }

    [HttpPut]
    public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
    {
        var memberId = User.GetMemberId();
        var member = await _memberRepositary.GetMemberForUpdate(memberId);
        if (member == null) return BadRequest("Member not found!");

        member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
        member.Description = memberUpdateDto.Description ?? member.Description;
        member.City = memberUpdateDto.City ?? member.City;
        member.Country = memberUpdateDto.Country ?? member.Country;
        member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

        // if user sends same data, without changes then 204 OK is sent. If we remove this BadRequest() is sent.
        _memberRepositary.Update(member);

        if (await _memberRepositary.SaveAllAsync()) return NoContent();

        return BadRequest("Faild to update member data.");
    }

    [HttpPost("upload-photo")]
    public async Task<ActionResult<Photo>> UploadPhoto([FromForm] IFormFile file)
    {
        var member = await _memberRepositary.GetMemberForUpdate(User.GetMemberId());
        if (member == null) return BadRequest("Member can't be found!");
        var result = await _photoService.UploadPhotoAsync(file);
        if (result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId,
            MemberId = User.GetMemberId()
        };
        if (member.ImageUrl == null)
        {
            member.ImageUrl = photo.Url;
            member.User.ImageUrl = photo.Url;
        }
        member.Photos.Add(photo);
        if (await _memberRepositary.SaveAllAsync()) return photo;
        return BadRequest("Error occured while uploading photo!");
    }

    [HttpPut("set-profile-image/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var member = await _memberRepositary.GetMemberForUpdate(User.GetMemberId());
        if (member == null) return BadRequest("User ID couldn't be found in token!");
        var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);
        if (photo == null || photo.Url == member.ImageUrl)
            return BadRequest($"Image with ID '${photo?.Id}' can't be set as profile image!");
        member.ImageUrl = photo.Url;
        member.User.ImageUrl = photo.Url;
        if (await _memberRepositary.SaveAllAsync()) return NoContent();

        return BadRequest("Unexpected error occured while setting profile image");
    }

    [HttpDelete("remove-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var member = await _memberRepositary.GetMemberForUpdate(User.GetMemberId());
        if (member == null) return BadRequest("User ID couldn't be found in token!");
        var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);
        if (photo == null || photo.Url == member.ImageUrl)
            return BadRequest($"Image with ID '${photo?.Id}' can't be deleted!");
        if (photo.PublicId != null)
        {
            var result = await _photoService.DeletePhotoAsync(photo.PublicId);
            if (result.Error != null) 
                return BadRequest(result.Error.Message);
        }

        member.Photos.Remove(photo);
        if (await _memberRepositary.SaveAllAsync()) 
            return Ok();
        
        return BadRequest("An unexpected error occured while deleting photo!");

    }

}

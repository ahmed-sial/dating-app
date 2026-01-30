using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Extensions;

public static class AppUserExtensions
{
    public static async Task<UserDto> ToUserDto(this AppUser appUser, ITokenService tokenService)
    {
        return new UserDto
        {
            Id = appUser.Id,
            DisplayName = appUser.DisplayName,
            ImageUrl = appUser.ImageUrl,
            Email = appUser.Email!,
            Token = await tokenService.CreateToken(appUser)
        };
    }
}

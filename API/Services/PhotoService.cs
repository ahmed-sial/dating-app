using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;

namespace API.Services;

public class PhotoService : IPhotoService
{
  private readonly Cloudinary _cloudinary;
  public PhotoService(IOptions<CloudinarySettings> options)
  {
    var op = options.Value;
    var account = new Account(op.CloudName, op.ApiKey, op.ApiSecret);
    _cloudinary = new Cloudinary(account);
  }
  public async Task<DeletionResult> DeletePhotoAsync(string publicId)
  {
    var deleteParams = new DeletionParams(publicId);
    return await _cloudinary.DestroyAsync(deleteParams);
  }

  public async Task<ImageUploadResult> UploadPhotoAsync(IFormFile file)
  {
    var uploadResult = new ImageUploadResult();
    if (file.Length > 0)
    {
      await using var stream = file.OpenReadStream();
      var uploadParams = new ImageUploadParams
      {
        File = new FileDescription(file.FileName, stream),
        Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
        Folder = "dating-app"
      };
      uploadResult = await _cloudinary.UploadAsync(uploadParams);
    }
    return uploadResult;
  }
}

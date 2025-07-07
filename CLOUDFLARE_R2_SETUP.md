# Cloudflare R2 Storage Setup

This project uses Cloudflare R2 as the primary storage solution for media files. R2 is S3-compatible and offers excellent performance and cost efficiency.

## Setup Instructions

### 1. Create Cloudflare R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Create a new bucket with a unique name
4. Note down your Account ID from the sidebar

### 2. Generate R2 API Tokens

1. Go to "Manage R2 API Tokens" in your R2 dashboard
2. Create a new API token with the following permissions:
   - **Object Read & Write** for your bucket
   - **Admin Read & Write** (optional, for bucket management)
3. Save the Access Key ID and Secret Access Key

### 3. Configure Environment Variables

Add the following variables to your `.env` file:

```bash
# Cloudflare R2 Storage Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_BUCKET=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Optional: Custom domain for public file access
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://files.yourdomain.com
```

### 4. Custom Domain (Optional but Recommended)

To serve files from your own domain:

1. In your R2 bucket settings, go to "Custom Domains"
2. Add your domain (e.g., `files.yourdomain.com`)
3. Add the required DNS records to your domain
4. Set the `CLOUDFLARE_R2_CUSTOM_DOMAIN` environment variable

## Features

- **Automatic Image Resizing**: Files are automatically resized to multiple sizes (thumbnail, medium, large)
- **Cost Effective**: R2 offers 10GB free storage and low egress costs
- **Global CDN**: Files are served through Cloudflare's global network
- **S3 Compatible**: Uses standard S3 API for maximum compatibility

## File Access

Files uploaded through PayloadCMS will be:
- Stored in Cloudflare R2
- Accessible via the R2 endpoint or custom domain
- Automatically optimized for web delivery
- Cached globally through Cloudflare's CDN

## Troubleshooting

### Common Issues

1. **403 Access Denied**: Check your API token permissions
2. **Bucket Not Found**: Verify bucket name and endpoint URL
3. **CORS Issues**: Configure CORS settings in your R2 bucket if accessing from browser

### Verify Configuration

You can test your R2 setup by uploading a file through the PayloadCMS admin panel at `/admin/collections/media/create`.

## Migration from Local Storage

If you have existing local files, you can migrate them to R2:

1. Use the AWS CLI with R2 endpoints to bulk upload files
2. Update database records to point to new R2 URLs
3. Consider writing a migration script for large datasets

## Cost Optimization

- Use appropriate image sizes for different use cases
- Configure lifecycle policies for old files
- Monitor usage through Cloudflare dashboard
- Consider using WebP format for better compression

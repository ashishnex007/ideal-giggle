## PEXELS

* Explore RATE_LIMITER
* Implement pagination 
* Add credits to photographers

## Unsplash 

### Guidelines

* All requests receive the v1 version of the API. We encourage you to specifically request this via the Accept-Version header: `Accept-Version: v1`
* All API uses must use the hotlinked image URLs returned by the API under the photo.urls  properties. This applies to all uses of the image and not just search results.
* When your application performs something similar to a download (like when a user chooses the image to include in a blog post, set as a header, etc.), `you must send a request to the download endpoint returned under the photo.links.download_location  property.`
* When displaying a photo from Unsplash, your application must attribute Unsplash, the Unsplash photographer, and contain a link back to their Unsplash profile. `All links back to Unsplash should use utm parameters in the ?utm_source=your_app_name&utm_medium=referral`
* Your application’s Access Key and Secret Key  must remain confidential. This may require using a proxy if accessing the API client-side.
* Applications should not require users to register for a developer account with the Unsplash API to use your application. If needed, build a proxy that signs requests on behalf of your users, allowing them to all share a single API key, or reach out to our team for an OAuth solution.

# pixabay


### Images 

| Name | Type | Description |
| --- | --- | --- |
| key | string | Your API key |
| q | string | Search keyword |
| image_type | string | `all`, `photo`, `illustration`, `vector` |
| orientation | string | `all`, `horizontal`, `vertical` |
| order | string | `popular`, `latest` |
| page | integer | page number |
| per_page | integer | results per page (max 200) |

# pexels

### Images

| Name | Type | Description |
| --- | --- | --- |
| key | string | Your API key |
| query | string | Search keyword |
| orientation | string | `landscape`, `portrait`, `square` |
| page | integer | page number |
| per_page | integer | results per page (max 80) |


# Accept Parameters from frontend (table format)

| Name | Type | Values |
| --- | --- | --- |
| page | integer | 1, 2, 3, ... |
| per_page | integer | 1, 2, 3, ... |
| orientation | string | `landscape`, `portrait`, `square` |
| order | string | `popular`, `latest` |
| image_type | string | `all`, `photo`, `illustration`, `vector` |
| query | string | Search keyword |
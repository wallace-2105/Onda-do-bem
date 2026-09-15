/**
 * Onda do Bem — Post Image Resolver
 *
 * Resolve a fonte da imagem da publicação, suportando tanto assets locais
 * empacotados em alta resolução quanto URLs remotas ou URIs locais do dispositivo.
 */

export function getPostImageSource(post: { id?: string; imageUrl?: string | null }) {
  if (post.id === 'post-3' || post.imageUrl === 'asset:eight-puppies') {
    return require('@/../assets/images/eight-puppies.jpg');
  }
  if (
    post.id === 'post-7' ||
    post.imageUrl === 'asset:street-recycling-bins' ||
    post.imageUrl?.includes('photo-1583847268964-b28dc8f51f92')
  ) {
    return require('@/../assets/images/street-recycling-bins.jpg');
  }
  if (
    post.id === 'post-8' ||
    post.imageUrl === 'asset:rio-pinheiros' ||
    post.imageUrl?.includes('photo-1544551763-46a013bb70d5')
  ) {
    return require('@/../assets/images/rio-pinheiros.jpeg');
  }
  if (
    post.id === 'post-4' ||
    post.imageUrl === 'asset:horta-solidaria' ||
    post.imageUrl?.includes('photo-1610348725531-843dff563e2c')
  ) {
    return require('@/../assets/images/Horta Solidária.png');
  }
  if (
    post.id === 'post-12' ||
    post.imageUrl === 'asset:beach-cans-cleanup'
  ) {
    return require('@/../assets/images/beach-cans-cleanup.jpg');
  }
  if (
    post.id === 'post-13' ||
    post.imageUrl === 'asset:beach-plastic-cups'
  ) {
    return require('@/../assets/images/beach-plastic-cups.jpg');
  }
  if (
    post.id === 'post-14' ||
    post.imageUrl === 'asset:beach-crowd-trash'
  ) {
    return require('@/../assets/images/beach-crowd-trash.jpg');
  }
  if (!post.imageUrl) {
    return null;
  }
  return { uri: post.imageUrl };
}


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
  if (!post.imageUrl) {
    return null;
  }
  return { uri: post.imageUrl };
}


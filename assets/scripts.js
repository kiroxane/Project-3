document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".gallery").forEach(function (gallery) {
    window.mauGallery(gallery, {
      columns: { xs: 1, sm: 2, md: 3, lg: 3, xl: 3 },
      lightBox: true,
      lightboxId: "myAwesomeLightbox",
      showTags: true,
      tagsPosition: "top",
    });
  });
});

(function () {
  function mauGallery(galleryElement, userOptions) {
    const options = Object.assign({}, mauGallery.defaults, userOptions);
    const tagsCollection = [];

    createRowWrapper(galleryElement);

    if (options.lightBox) {
      createLightBox(galleryElement, options.lightboxId, options.navigation);
    }

    listeners(galleryElement, options);

    const items = Array.from(galleryElement.children).filter(function (el) {
      return el.classList.contains("gallery-item");
    });

    items.forEach(function (item) {
      responsiveImageItem(item);
      moveItemInRowWrapper(galleryElement, item);
      wrapItemInColumn(item, options.columns);
      const theTag = item.dataset.galleryTag;
      if (
        options.showTags &&
        theTag !== undefined &&
        tagsCollection.indexOf(theTag) === -1
      ) {
        tagsCollection.push(theTag);
      }
    });

    if (options.showTags) {
      showItemTags(galleryElement, options.tagsPosition, tagsCollection);
    }

    galleryElement.style.display = "";
    galleryElement.style.opacity = "0";
    galleryElement.style.transition = "opacity 500ms";
    requestAnimationFrame(function () {
      galleryElement.style.opacity = "1";
    });
  }

  mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  function createRowWrapper(element) {
    const firstChild = element.firstElementChild;
    if (!firstChild || !firstChild.classList.contains("row")) {
      const row = document.createElement("div");
      row.className = "gallery-items-row row";
      element.appendChild(row);
    }
  }

  function wrapItemInColumn(element, columns) {
    const wrapper = document.createElement("div");
    if (typeof columns === "number") {
      wrapper.className = "item-column mb-4 col-" + Math.ceil(12 / columns);
    } else if (typeof columns === "object" && columns !== null) {
      let columnClasses = "";
      if (columns.xs) columnClasses += " col-" + Math.ceil(12 / columns.xs);
      if (columns.sm) columnClasses += " col-sm-" + Math.ceil(12 / columns.sm);
      if (columns.md) columnClasses += " col-md-" + Math.ceil(12 / columns.md);
      if (columns.lg) columnClasses += " col-lg-" + Math.ceil(12 / columns.lg);
      if (columns.xl) columnClasses += " col-xl-" + Math.ceil(12 / columns.xl);
      wrapper.className = "item-column mb-4" + columnClasses;
    } else {
      console.error(
        "Columns should be defined as numbers or objects. " +
          typeof columns +
          " is not supported."
      );
      return;
    }
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  }

  function moveItemInRowWrapper(gallery, element) {
    const row = gallery.querySelector(".gallery-items-row");
    if (row) row.appendChild(element);
  }

  function responsiveImageItem(element) {
    if (element.tagName === "IMG") {
      element.classList.add("img-fluid");
    }
  }

  function openLightBox(imgElement, lightboxId) {
    const modal = document.getElementById(lightboxId);
    const lightboxImg = modal.querySelector(".lightboxImage");
    lightboxImg.setAttribute("src", imgElement.getAttribute("src"));
    bootstrap.Modal.getOrCreateInstance(modal).toggle();
  }

  function getCurrentImagesCollection() {
    const activeTagEl = document.querySelector(".tags-bar span.active-tag");
    const activeTag = activeTagEl ? activeTagEl.dataset.imagesToggle : "all";
    const collection = [];
    document.querySelectorAll(".item-column").forEach(function (col) {
      const img = col.querySelector("img");
      if (!img) return;
      if (activeTag === "all" || img.dataset.galleryTag === activeTag) {
        collection.push(img);
      }
    });
    return collection;
  }

  function prevImage() {
    const lightboxImg = document.querySelector(".lightboxImage");
    const currentSrc = lightboxImg.getAttribute("src");
    const collection = getCurrentImagesCollection();
    let index = 0;
    collection.forEach(function (img, i) {
      if (img.getAttribute("src") === currentSrc) index = i;
    });
    const prev =
      collection[index - 1] || collection[collection.length - 1];
    lightboxImg.setAttribute("src", prev.getAttribute("src"));
  }

  function nextImage() {
    const lightboxImg = document.querySelector(".lightboxImage");
    const currentSrc = lightboxImg.getAttribute("src");
    const collection = getCurrentImagesCollection();
    let index = 0;
    collection.forEach(function (img, i) {
      if (img.getAttribute("src") === currentSrc) index = i;
    });
    const next = collection[index + 1] || collection[0];
    lightboxImg.setAttribute("src", next.getAttribute("src"));
  }

  function createLightBox(gallery, lightboxId, navigation) {
    const id = lightboxId || "galleryLightbox";
    const arrowStyle =
      "cursor:pointer;position:absolute;top:50%;transform:translateY(-50%);" +
      "width:40px;height:40px;border-radius:50%;background:#fff;color:#000;" +
      "display:flex;align-items:center;justify-content:center;font-size:24px;" +
      "font-weight:bold;z-index:1056;user-select:none;line-height:1;";
    const html =
      '<div class="modal fade" id="' +
      id +
      '" tabindex="-1" role="dialog" aria-hidden="true">' +
      '<div class="modal-dialog modal-lg modal-dialog-centered" role="document">' +
      '<div class="modal-content" style="position:relative;background:transparent;border:0;">' +
      (navigation
        ? '<button type="button" class="mg-prev" aria-label="Image précédente" style="' + arrowStyle + 'left:10px;border:0;">&lsaquo;</button>'
        : "") +
      '<div class="modal-body" style="padding:0;">' +
      '<img class="lightboxImage img-fluid" alt="Image agrandie"/>' +
      "</div>" +
      (navigation
        ? '<button type="button" class="mg-next" aria-label="Image suivante" style="' + arrowStyle + 'right:10px;border:0;">&rsaquo;</button>'
        : "") +
      "</div></div></div>";
    gallery.insertAdjacentHTML("beforeend", html);
  }

  function showItemTags(gallery, position, tags) {
    let tagItems =
      '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
    tags.forEach(function (value) {
      tagItems +=
        '<li class="nav-item"><span class="nav-link" data-images-toggle="' +
        value +
        '">' +
        value +
        "</span></li>";
    });
    const tagsRow =
      '<ul class="my-4 tags-bar nav nav-pills">' + tagItems + "</ul>";
    if (position === "bottom") {
      gallery.insertAdjacentHTML("beforeend", tagsRow);
    } else if (position === "top") {
      gallery.insertAdjacentHTML("afterbegin", tagsRow);
    } else {
      console.error("Unknown tags position: " + position);
    }
  }

  function filterByTag(tagElement) {
    if (tagElement.classList.contains("active-tag")) return;
    document.querySelectorAll(".active-tag").forEach(function (el) {
      el.classList.remove("active", "active-tag");
    });
    tagElement.classList.add("active", "active-tag");
    const tag = tagElement.dataset.imagesToggle;
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      const column = item.closest(".item-column");
      if (!column) return;
      if (tag === "all" || item.dataset.galleryTag === tag) {
        column.style.display = "";
      } else {
        column.style.display = "none";
      }
    });
  }

  function listeners(gallery, options) {
    gallery.addEventListener("click", function (e) {
      const target = e.target;
      if (
        target.classList.contains("gallery-item") &&
        options.lightBox &&
        target.tagName === "IMG"
      ) {
        openLightBox(target, options.lightboxId);
        return;
      }
      const navLink = target.closest(".nav-link");
      if (navLink && gallery.contains(navLink)) {
        filterByTag(navLink);
        return;
      }
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest(".mg-prev")) {
        e.preventDefault();
        prevImage();
      } else if (e.target.closest(".mg-next")) {
        e.preventDefault();
        nextImage();
      }
    });
  }

  window.mauGallery = mauGallery;
})();

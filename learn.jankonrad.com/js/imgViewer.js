  let img = new Image();
  img.src = "/assets/img/gimp/image1.png";
  img.onload = () => {
    let c = document.getElementById("preview");
    c.width = img.width;
    c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
  };
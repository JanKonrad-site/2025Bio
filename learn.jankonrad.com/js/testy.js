 function checkAnswer(button, correct) {
    if (correct) {
      button.classList.remove("btn-outline-secondary");
      button.classList.add("btn-success");
    } else {
      button.classList.remove("btn-outline-secondary");
      button.classList.add("btn-danger");
    }
    button.disabled = true;
    let siblings = button.parentElement.querySelectorAll("button");
    siblings.forEach(b => b.disabled = true);
  }
  


  // Gimp gallery
(function(){
  function parseImages(el){
    try { return JSON.parse(el.getAttribute('data-images') || '[]'); }
    catch(e){ return []; }
  }
  function setImg(imgId, src){
    var img = document.getElementById(imgId);
    if(img){ img.src = src; }
  }
  function move(dir, btn){
    var imgId = btn.getAttribute(dir === -1 ? 'data-gallery-prev' : 'data-gallery-next');
    if(!imgId) return;
    var cfgHolder = document.querySelector('[data-gallery-src="'+imgId+'"]');
    if(!cfgHolder) return;
    var list = parseImages(cfgHolder);
    if(list.length === 0) return;

    // Normalize absolute vs relative by comparing file names
    var img = document.getElementById(imgId);
    var current = img.src.split('/').pop();
    var idx = list.findIndex(x => x.split('/').pop() === current);
    if(idx === -1) idx = 0;

    var next = (idx + dir + list.length) % list.length;
    setImg(imgId, list[next]);
  }
  document.addEventListener('click', function(e){
    if(e.target.matches('[data-gallery-prev]')) { e.preventDefault(); move(-1, e.target); }
    if(e.target.matches('[data-gallery-next]')) { e.preventDefault(); move(1, e.target); }
  });
})();



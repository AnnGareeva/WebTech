const g = document.querySelector('g');
const circle = document.querySelector('circle');

var box_text = document.querySelector('label');
const checkbox = document.querySelector('input');
var smile_obj = document.querySelector('path');


function set_sad_state(box_text, smile_obj) {
  box_text.innerHTML = "Sad";
  smile_obj.setAttribute("d", "M 150 200 Q 225 100 300 200");
}

function set_happy_state(box_text, smile_obj) {
  box_text.innerHTML = "Happy";
  smile_obj.setAttribute("d","M 150 200 Q 225 300 300 200");
}

checkbox.addEventListener('click', () =>
{
      if (checkbox.checked === false  && box_text.innerHTML === "Happy") {
          set_sad_state(box_text, smile_obj);
      }
      else
      {
          set_happy_state(box_text, smile_obj);
      }
  });

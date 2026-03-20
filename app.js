document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("mytable");
  const infoBox = document.getElementById("infoBox");


  
  fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => console.log(json))
});

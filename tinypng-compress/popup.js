document.getElementById('compressForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var files = document.getElementById('fileInput').files;
    var apiKey = document.getElementById('apiKey').value;
    console.log(files);
    console.log(apiKey);
    alert('Files: ' + files + '\nAPI Key: ' + apiKey);
    // TODO: Call TinyPNG API to compress the files
  });
window.addEventListener('load', () => {
    const video = document.getElementById("video");
    const estado = document.getElementById("estado");
    let rostrosRegistrados = [];  
    let imagenesRegistradas = []; 
  
    const modeloURL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
  
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modeloURL),
      faceapi.nets.faceLandmark68Net.loadFromUri(modeloURL),
      faceapi.nets.faceRecognitionNet.loadFromUri(modeloURL),
    ]).then(iniciarVideo).catch(error => {
      estado.innerText = "❌ Error al cargar modelos.";
      estado.classList.add('estado-error');
      console.error(error);
    });
  
    function iniciarVideo() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          estado.innerText = "✅ Modelos cargados. Cámara activa.";
          estado.classList.add('estado-exito');
        })
        .catch(err => {
          estado.innerText = "❌ Error al acceder a la cámara.";
          estado.classList.add('estado-error');
          console.error(err);
        });
    }
  
    async function registrarRostro() {
      const deteccion = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!deteccion) {
        estado.innerText = "❗ No se detectó ningún rostro.";
        estado.classList.add('estado-error');
        return;
      }
  
      const canvas = faceapi.createCanvasFromMedia(video);
      const dataURL = canvas.toDataURL('image/jpeg'); 
  
      rostrosRegistrados.push(deteccion.descriptor);
      imagenesRegistradas.push(dataURL);
  
      estado.innerText = "✅ Rostro registrado correctamente.";
      estado.classList.add('estado-exito');
    }
  
    async function verificarRostro() {
      if (rostrosRegistrados.length === 0) {
        estado.innerText = "⚠️ Registra un rostro primero.";
        estado.classList.add('estado-error');
        return;
      }
  
      const deteccion = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!deteccion) {
        estado.innerText = "❗ No se detectó ningún rostro.";
        estado.classList.add('estado-error');
        return;
      }
  
      let rostroVerificado = false;
      let imagenCoincidente = null;
  
      for (let i = 0; i < rostrosRegistrados.length; i++) {
        const distancia = faceapi.euclideanDistance(rostrosRegistrados[i], deteccion.descriptor);
        if (distancia < 0.5) {
          rostroVerificado = true;
          imagenCoincidente = imagenesRegistradas[i]; 
          break;
        }
      }
  
      if (rostroVerificado) {
        estado.innerText = "✅ Rostro verificado con éxito.";
        estado.classList.add('estado-exito');
        const imagenVerificada = document.createElement('img');
        imagenVerificada.src = imagenCoincidente;
        document.body.appendChild(imagenVerificada); 
        setTimeout(() => {
          window.location.href = 'index.html'; 
        }, 2000);
      } else {
        estado.innerText = "❌ Rostro no coincide.";
        estado.classList.add('estado-error');
      }
    }
  
    window.registrarRostro = registrarRostro;
    window.verificarRostro = verificarRostro;
  });
  
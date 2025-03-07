  // Tu nueva clave de API de OpenWeatherMap 
  const apiKey = '7e4225a14c2a4ada0d76593ce89c66b4';  // Nueva clave de API
  const ciudad = 'Talca,CL'; // Ciudad Talca, Chile

  // URL de la API
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&lang=es&units=metric`;

  // Usando fetch() para obtener los datos
  fetch(url)
      .then(response => response.json())
      .then(data => {
          const temperatura = data.main.temp;
          const descripcion = data.weather[0].description;
          const humedad = data.main.humidity;
          const ciudad = data.name;
          const iconCode = data.weather[0].icon; // Obtenemos el código del icono

          // Construimos la URL del icono con mayor resolución
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Añadido @2x para obtener iconos de mayor calidad

          // Crear el contenido para las dos columnas
          const leftColumn = `
              <h3>Clima en ${ciudad}</h3>
              <img src="${iconUrl}" alt="${descripcion}">
          `;

          const rightColumn = `
              <p>Temperatura: ${temperatura}°C</p>
              <p>Descripción: ${descripcion}</p>
              <p>Humedad: ${humedad}%</p>
          `;

          // Colocar el contenido en sus respectivas columnas
          document.getElementById('clima').innerHTML = `
              <div class="left-column">${leftColumn}</div>
              <div class="right-column">${rightColumn}</div>
          `;
      })
      .catch(error => {
          // Si ocurre un error en la solicitud
          document.getElementById('clima').innerHTML = '<p>No se pudo obtener la información del clima.</p>';
      });
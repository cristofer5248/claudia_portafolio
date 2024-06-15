class Heart {
  constructor(id) {
    this.counter = 0; // Inicializa el contador
    const heart = document.getElementById(id);
    const text = heart.querySelector('.heart-text');
    this.sayings = [
      'Holi blanquis',
      'I miss you',
      'So',
      'So',
      'So much',
      'te quiero mucho',
      'vuelve',
      'asi bien bonita con',
      'esos outfits ',
      'jaja',
      'Si me queres',
      'me traeras algo',
      'o recibire un correo',
      'si tocas aqui',
      'nuevamente, Lista?',
      ' enviando...'];


    heart.addEventListener('click', () => {
      //enviarPulse();
      this.addText(text, this.sayings);
    });
  }

  getText(sayings) {
    const selection = this.counter % sayings.length; // Selecciona el texto secuencialmente
    this.counter++; // Incrementa el contador
    console.log(selection + "y" + sayings.length);
    if (selection == sayings.length - 1) {
      console.log("ya cayo");
      $('#exampleModal').modal('show');
      // enviarPulse("enviando");
    }
    return sayings[selection];
  }

  addText(container, sayings) {
    const str = this.getText(sayings);
    const words = str.split(' ');

    container.innerHTML = '';

    words.forEach(word => {
      const span = document.createElement('span');
      span.innerHTML = word;
      container.appendChild(span);
    });

    return container;
  }
}

const heartContainer = new Heart('heart-container');

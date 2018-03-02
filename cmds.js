
const {log, biglog, errorlog, colorize} = require('./out');
const model = require('./model');

exports.helpCmd = rl => {

    log('Comandos:');
    log('h/help - Muestra la lista de comandos');
    log('list - Lista todas las preguntas disponibles');
    log('show <id> - Muestra la pregunta y la respuesta asociadas al identificador id');
    log('add - Añadir interactivamente un nuevo quiz al programa');
    log('delete <id> - Elimina la pregunta asociada al identificador id');
    log('edit <id> - Edita la pregunta y respuesta del quiz indicado');
    log('test <id> - Probar el quiz indicado');
    log('p/play - Jugar a contestar todas las preguntas correctamente');
    log('credits - Creditos');
    log('q/quit - Terminar el programa');
    rl.prompt();
};


exports.listCmd = rl => {
	log(`  [${colorize('id', 'magenta')}]: Pregunta`);
	model.getAll().forEach((quiz, id) => {
		log(`  [${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
};


exports.showCmd = (rl, id) => {

	if (typeof id === 'undefined'){
		errorlog('El valor del parámetro id no es válido');
	} else {
		try {
			const quiz = model.getByIndex(id);
			log(`  [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer} `);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};


exports.addCmd = rl => {

	rl.question(colorize('Introduce la pregunta: ', 'red'), question => {

		rl.question(colorize('Introduce la respuesta: ', 'red'), answer => {

			model.add(question,answer);
			log(`${colorize('se ha añadido','magenta')}: ${question}  ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
};


exports.deleteCmd = (rl, id) => {
	if (typeof id === 'undefined'){
		errorlog('El valor del parámetro id no es válido');
	} else {
		try {
			model.deleteByIndex(id);
		} catch(error) {
			errorlog(error.message);
		}
	}
	rl.prompt();
};


exports.editCmd = (rl, id) => {
	if (typeof id === 'undefined'){
		errorlog('El valor del parámetro id no es válido');
		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
			rl.question(colorize('Introduce la pregunta: ', 'red'), question => {
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				rl.question(colorize('Introduce la respuesta: ', 'red'), answer => {
					model.update(id, question, answer);
					log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question}  ${colorize('=>','magenta')} ${answer}`);
					rl.prompt();
				});
			});
		} catch (error) {
			errorlog(error.message);
			rl.prompt();
		}
	}
};


exports.testCmd = (rl, id) => {
	if (typeof id === 'undefined'){
		errorlog('El valor del parámetro id no es válido');
		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			const pregunta = quiz.question + '?';
			rl.question(colorize(pregunta, 'red'), respuesta => {
				respuesta = respuesta.toLowerCase().trim();
				if(respuesta === quiz.answer){
						log('CORRECTO');
					log('Su respuesta es: ')
					biglog("Correcta", "green");
					rl.prompt();
				} else {
						log('INCORRECTO');
					log('Su respuesta es: ')
					biglog("Incorrecta", "red");
					rl.prompt();
				}
			});
		} catch (error) {
			errorlog(error.message);
			rl.prompt();
		}
	}
};


exports.playCmd = rl => {
	//Puntuación
	let score = 0;

	//Array de ids existentes
	let toBeResolved = [];
	for (var i = model.count() - 1; i >= 0; i--) {
		toBeResolved[i] = i;
	}


	const jugarUna = () => {
		if (toBeResolved.length===0){
			let msg = 'Puntuacion: ' + score;
			biglog(msg, 'blue');
			rl.prompt();
		} else {
			//Coge una pregunta al azar y la borra del array
			let id =Math.random() * toBeResolved.length;
			id = Math.floor(id);

			const quiz = model.getByIndex(toBeResolved[id]);
			toBeResolved.splice(id, 1);
			const pregunta = quiz.question + '?';
			rl.question(colorize(pregunta, 'red'), respuesta => {
				respuesta = respuesta.toLowerCase().trim();
					if(respuesta === quiz.answer){
						log('CORRECTO');
						log('Su respuesta es ')
						biglog("Correcta", "green");
						score +=1;
						if(toBeResolved.length !== 0) {
							log(`Su puntuación actual es: ${score}`);
						}
						jugarUna();
					} else {
						log('INCORRECTO');
						log('Su respuesta es: ')
						biglog("Incorrecta", "red");
						log('fin');
						let msg = 'Puntuacion: ' + score;
						biglog(msg, 'blue');
						rl.prompt();
					}
			});
		}
	}
	jugarUna();
};


exports.creditsCmd = rl => {
	log('Autor de la práctica:');
	log('Guillermo Mejías');
	rl.prompt();
};


exports.quitCmd = rl => {
	rl.close();
};


const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require('./out');
const {models} = require('./model');

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
	/* P2_QUIZ
	log(`  [${colorize('id', 'magenta')}]: Pregunta`);
	model.getAll().forEach((quiz, id) => {
		log(`  [${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
	*/
	//P3_QUIZ
	models.quiz.findAll()
	.each(quiz => {
		log(`  [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	})

};

const validateId = id => {

	return new Sequelize.Promise((resolve, reject) => {
		if (typeof id === "undefined") {
			reject(new Error('falta el parámetro <id>.'));
		} else {
			id = parseInt(id);
			if (Number.isNaN(id)) {
				reject(new Error(`El valor del parámetro <id> no es un número.`));
			} else {
				resolve(id);
			}
		}
	});
};


exports.showCmd = (rl, id) => {
	/*
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
	*/

	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe el quiz asociado al id=${id}.`);
		}
		log(`${colorize(quiz.id,'magenta')}: ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


const makeQuestion = (rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};


exports.addCmd = rl => {
/* P2_QUIZ
	rl.question(colorize('Introduce la pregunta: ', 'red'), question => {

		rl.question(colorize('Introduce la respuesta: ', 'red'), answer => {

			model.add(question,answer);
			log(`${colorize('se ha añadido','magenta')}: ${question}  ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
	*/
//P3_QUIZ
	makeQuestion(rl, 'Introduzca una pregunta: ')
	.then(q => {
		return makeQuestion(rl, 'Introduzca la respuesta: ')
		.then(a => {
			return {question: q, answer: a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then((quiz) => {
		log(`${colorize('se ha añadido','magenta')}: ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(' El quiz es erroneo:');
		error.errors.forEach(({message}) => errorLog(message));
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.deleteCmd = (rl, id) => {
	/*
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
	*/

	//P3_QUIZ
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.editCmd = (rl, id) => {
	/*
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
	*/

	//P3_QUIZ
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe el quiz asociado al id=${id}.`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca la pregunta: ')
		.then(q => {
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
	 		return makeQuestion(rl, 'Introduzca la respuesta: ')
	 		.then (a => {
	 			quiz.question = q;
	 			quiz.answer = a;
	 			return quiz;
	 		});
		});
	})
	.then(quiz => {
		return quiz.save();
	})
	.then(quiz => {
		log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);

	})

	.catch(Sequelize.ValidationError, error => {
		errorlog(' El quiz es erroneo:');
		error.errors.forEach(({message}) => errorLog(message));
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.testCmd = (rl, id) => {
	/*
	if (typeof id === 'undefined'){
		errorlog('El valor del parámetro id no es válido');
		rl.prompt();
	} else {
		try {
			const quiz = model.getByIndex(id);
			const pregunta = quiz.question + '?';
			rl.question(colorize(pregunta, 'red'), respuesta => {
				respuesta = respuesta.toLowerCase().trim();
				answer = quiz.answer.toLowerCase().trim();
				if(respuesta === answer){
					log('Su respuesta es correcta.');
					biglog("Correcta", "green");
					rl.prompt();
				} else {
						log('Su respuesta es incorrecta.');
					biglog("Incorrecta", "red");
					rl.prompt();
				}
			});
		} catch (error) {
			errorlog(error.message);
			rl.prompt();
		}
	}
	*/

	//P3_QUIZ
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe el quiz asociado al id=${id}.`);
		}
		return new Promise((resolve, reject) => {

			 makeQuestion(rl, `${quiz.question} ?`)
			.then(a => {
				if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){ 
						log('Su respuesta es correcta.');
						biglog("Correcta", "green");
						resolve()
					} else { 
						log('Su respuesta es incorrecta.');
						biglog("Incorrecta", "red")
						resolve()
					}
			});
		});
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});

};


exports.playCmd = rl => {
	/*
	//Puntuación
	let score = 0;

	//Array de ids existentes
	let toBeResolved = [];
	for (var i = model.count() - 1; i >= 0; i--) {
		toBeResolved[i] = i;
	}


	const jugarUna = () => {
		if (toBeResolved.length===0){
			log(`Fin del juego. Aciertos:  ${score}`);
			log('No hay nada más que preguntar.');
			biglog(score, 'blue');
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
				answer = quiz.answer.toLowerCase().trim();
					if(respuesta === answer){
						score +=1;
						log(`CORRECTO - Lleva ${score} aciertos.`);
						jugarUna();
					} else {
						log('INCORRECTO.');
						log(`Fin del juego. Aciertos: ${score}`);
						biglog(score, 'blue');
						rl.prompt();
					}
			});
		}
	}
	jugarUna();
	*/

	//P3_QUIZ

	let score = 0;
	let toBeResolved = [];

	

	const playOne = () => {
		return new Promise((resolve, reject) => {
			if (toBeResolved.length <= 0) {
				resolve();
				return;
			}

			let id = Math.floor(Math.random() * toBeResolved.length);
			let quiz = toBeResolved[id];
			toBeResolved.splice(id, 1);

			return makeQuestion(rl, `${quiz.question} ` )
				.then(a => {
					if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){
						score++;
						log(`CORRECTO - Lleva ${score} aciertos.`);
						resolve(playOne());
					} else {
						log('INCORRECTO.');
						resolve();
					}
				});
		});
	};
	

	models.quiz.findAll({raw: true})
	.then(quizzes => {
		toBeResolved = quizzes;
	})

	.then(() => {
		return playOne();
	})

	.catch(error => {
		errorlog(error.message);
	})

	.then(() => {
		log(`Fin del juego. Aciertos: ${score}`);
		biglog(score, 'blue');
		rl.prompt();
	});





exports.creditsCmd = rl => {
	log('Autor de la práctica:');
	log('Guillermo Mejías');
	log('GuillermoMejias');
	rl.prompt();
};


exports.quitCmd = rl => {
	rl.close();
};

}

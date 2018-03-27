
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


const makeQuestion = (rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};


exports.showCmd = (socket, rl, id) => {
	
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe el quiz asociado al id=${id}.`);
		}
		log(socket, `${colorize(quiz.id,'magenta')}: ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.listCmd = (socket, rl) => {
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
		log(socket, `  [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	})

};



exports.addCmd = (socket, rl) => {

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
		log(socket, `${colorize('se ha añadido','magenta')}: ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, ' El quiz es erroneo:');
		error.errors.forEach(({message}) => errorLog(socket, message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.deleteCmd = (socket, rl, id) => {
	

	//P3_QUIZ
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.editCmd = (socket, rl, id) => {

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
		log(socket, `Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${quiz.question}  ${colorize('=>','magenta')} ${quiz.answer}`);

	})

	.catch(Sequelize.ValidationError, error => {
		errorlog(socket, ' El quiz es erroneo:');
		error.errors.forEach(({message}) => errorLog(socket, message));
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.testCmd = (socket, rl, id) => {
	

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
						log(socket, 'Su respuesta es correcta.');
						biglog(socket, "Correcta", "green");
						resolve()
					} else { 
						log(socket, 'Su respuesta es incorrecta.');
						biglog(socket, "Incorrecta", "red")
						resolve()
					}
			});
		});
	})
	.catch(error => {
		errorlog(socket, error.message);
	})
	.then(() => {
		rl.prompt();
	});

};


exports.playCmd = (socket, rl) => {

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
						log(socket, `CORRECTO - Lleva ${score} aciertos.`);
						resolve(playOne());
					} else {
						log(socket, 'INCORRECTO.');
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
		errorlog(socket, error.message);
	})

	.then(() => {
		log(socket, `Fin del juego. Aciertos: ${score}`);
		biglog(socket, score, 'blue');
		rl.prompt();
	});


}


exports.creditsCmd = (socket, rl) => {
	log(socket, 'Autor de la práctica:');
	log(socket, 'Guillermo Mejías');
	rl.prompt();
};


exports.quitCmd = (socket, rl) => {
	rl.close();
	socket.end();
};


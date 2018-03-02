	
 const fs = require('fs');

//Fichero donde se guardan los quizes
const DB_FILENAME = 'quizzes.json';

//Variable que guarda los quizzes
let quizes = [
	{
		"question": "Capital de Italia",
		"answer": "Roma"
	},
	{
		"question": "Capital de Francia",
		"answer": "París"
	},
	{
		"question": "Capital de España",
		"answer": "Madrid"
	},
	{
		"question": "Capital de Portugal",
		"answer": "Lisboa"
	}
];


//Función que lee el fichero
const load = () => {
	fs.readFile(DB_FILENAME, (err,data) => {
		if (err) {
			if (err.code === 'ENOENT') {
				save();
				return;
			}
			throw err;
		}
		let json = JSON.parse(data);

		if (json) {
			quizes = json;
		}
	});
};


const save = () => {
	fs.writeFile(DB_FILENAME, JSON.stringify(quizes), err => {
		if (err) throw err;
	});
};








//Cuenta el número de quizzes guardados
exports.count = () => quizes.length;

//Añade un quiz a quizes
exports.add = (question,answer) => {
	quizes.push({
		question: (question || "").trim(),
		answer: (answer || "").trim()

	});
	save();
};
 
//Actualiza el quiz situado en la posición id
exports.update = (id,question,answer) =>  {
	const quiz = quizes[id];
	if (typeof quiz === 'undefined'){
		throw new Error('El valor del parámetro id no es válido');
	}
	quizes.splice(id, 1, {
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

//Devuelve todos los quizes existentes
exports.getAll = () => JSON.parse(JSON.stringify(quizes));

//Devuelve el quiz en la posición id
exports.getByIndex = id => {
	const quiz = quizes[id];
	if (typeof quiz === 'undefined'){
		throw new Error('El valor del parámetro id no es válido');
	}
	return JSON.parse(JSON.stringify(quiz));
};

//Elimina el quiz en la posición id
exports.deleteByIndex = id => {
	const quiz = quizes[id];
	if (typeof quiz === 'undefined'){
		throw new Error('El valor del parámetro id no es válido');
	}
	quizes.splice(id,1);
	save();
};

//Carga los quizes almacenados en el fichero
load();
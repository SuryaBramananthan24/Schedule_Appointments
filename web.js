const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {body,validationResult} = require('express-validator');

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'));

mongoose.connect('mongodb+srv://Surya:Mongodbsurya%40123@database.ivw86.mongodb.net/?retryWrites=true&w=majority&appName=Database');
mongoose.connection.on('open',()=>{console.log('Connected To MongoDB');});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','Home.html'));
});
app.get('/sl',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','sl.html'));
});
app.get('/sd',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','sd.html'));
});
app.get('/ss',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','ss.html'));
});
app.get('/pl',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','pl.html'));
});
app.get('/ps',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','ps.html'));
});
app.get('/pd',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','pd.html'));
});
app.get('/ma',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','ma.html'));
});

app.get('/gsd',(req,res)=>{
	mongoose.connection.db.collection("Professor_Signup").find({}).toArray()
		.then(data =>{
			 res.json(data);
		})
		.catch(err =>{
			console.log('Fething error',err);
		})	
});

app.get('/gpn',(req,res)=>{
	const Professor_Name = req.query.Professor_Name;
	mongoose.connection.db.collection("Student_Appointments")
		.find({Professor_Name}).toArray()
		.then(data => res.json(data))
		.catch(err =>{
			console.log('Fething error',err);
		})	
});

app.get('/gsn',(req,res)=>{
	const Student_Name = req.query.Student_Name;
	mongoose.connection.db.collection("Student_Appointments")
		.find({Student_Name}).toArray()
		.then(data => res.json(data))
		.catch(err =>{
			console.log('Fething error',err);
		})	
});

app.delete('/dsa',(req,res)=>{
	const Student_Name = req.query.Student_Name;
	mongoose.connection.db.collection("Student_Appointments").findOneAndDelete({Student_Name : Student_Name})
		.then(delstud => {
			console.log("Student Appointment Cancelled :",delstud);
		})
		.catch(err => console.log(err))
});

app.delete('/csa',(req,res)=>{
	const Professor_Name = req.query.Professor_Name;
	mongoose.connection.db.collection("Student_Appointments").findOneAndDelete({Professor_Name : Professor_Name})
		.then(delstud => {
			console.log("Student Appointment Cancelled :",delstud);
		})
		.catch(err => console.log(err))
});

app.post('/apd',(req,res)=>{
	const {Professor_Name,Student_Name,Time} = req.body;
	mongoose.connection.db.collection("Student_Appointments").insertOne({ Professor_Name,Student_Name,Time })
		.then(result =>{
			console.log("Appointment Added at InsertionId :",result.insertedId);
		})
		.catch(err =>{
			console.error(err);
		})
});

app.post('/gsn',
	[
		body('email').isEmail().withMessage("Provide Valid E-mail"),
		body('password').isLength({min:8}).withMessage("Passwords must have 8 characters"),
	],
	(req,res)=>{
		const errors = validationResult(req);
        if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
        }		
		const {email,password} = req.body;
		mongoose.connection.db.collection("Student_Signup").findOne({ email })
			.then(user =>{
				if(!user){ return res.status(401).send("<h2>User not found </h2>");}
				bcrypt.compare(password,user.password)
					.then(isPassword =>{
						if(!isPassword){
							return res.status(401).send("<h2>Wrong Password</h2>");
						}
						return res.json({ success : true, Student_Name : user.fullname });
						console.log(user.fullname);
					})
					.catch(err=>{
						console.error(err);
					})
			})
			.catch(err=>{
				console.log(err);
			})
	});
		
app.post('/gpn',
	[
		body('email').isEmail().withMessage("Provide Valid E-mail"),
		body('password').isLength({min:8}).withMessage("Passwords must have 8 characters"),
	],
	(req,res)=>{
		const errors = validationResult(req);
        if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
        }		
		const {email,password} = req.body;
		mongoose.connection.db.collection("Professor_Signup").findOne({ email })
			.then(user =>{
				if(!user){ return res.status(401).send("<h2>User not found </h2>");}
				bcrypt.compare(password,user.password)
					.then(isPassword =>{
						if(!isPassword){
							return res.status(401).send("<h2>Wrong Password</h2>");
						}
						return res.json({ success : true, Professor_Name : user.fullname });
						console.log(user.fullname);
					})
					.catch(err=>{
						console.error(err);
					})
			})
			.catch(err=>{
				console.log(err);
			})
	});

app.post('/ss',
	[	
		body('fullname').notEmpty().withMessage("Please provide name"),
		body('email').isEmail().withMessage("Provide valid Email Format"),
		body('password').isLength({min:8}).withMessage("Password must be of length 8"),
	],
	(req,res) => {
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			return res.status(400).json({errors:errors.array()});
		}
		const {fullname,email,password} = req.body;
		bcrypt.hash(password,10)
			.then(hashedpassword =>{
				mongoose.connection.db.collection("Student_Signup").insertOne({fullname,email,password:hashedpassword})
					.then(result =>{
						console.log("Signup data inserted on ID: ",result.insertedId);
						res.redirect("sl");
					})
					.catch(err =>{
						console.error(err);
					})
			})
			.catch(err =>{
				console.error(err);
			})
	});

app.post('/ps',
	[
		body('fullname').notEmpty().withMessage("Provide Name"),
		body('email').isEmail().withMessage("Provide Valid Email"),
		body('password').isLength({min:8}).withMessage("Password must be of length 8"),
		body('time1').notEmpty().withMessage("Provide Available Timings"),
		body('time2').notEmpty().withMessage("Provide Available Timings"),
	],
	(req,res)=>{
		const errors = validationResult(req);
		if(!errors.isEmpty()){
			return res.status(400).json({errors:errors.array()});
		}
		const {fullname,email,password,time1,time2} = req.body;
		bcrypt.hash(password,10)
			.then(hashedpassword =>{
				mongoose.connection.db.collection("Professor_Signup").insertOne({fullname,email,password:hashedpassword,time1,time2})
					.then(result =>{
						console.log("Professor Signup Data inserted successfully on Insertion Id:",result.insertedId);
						res.redirect("pl");
					})
					.catch(err =>{
						console.error(err);
					})
			})
			.catch(err=>{
				console.error(err);
			})
	});	
app.listen(4000,()=>{
    console.log("Server Running");
});
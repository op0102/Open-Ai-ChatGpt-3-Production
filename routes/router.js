const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = express.Router();
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const Authenticate = require("../middleware/Authenticate");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


//register user
router.post("/register", async (req, res) => {
    const { username, email, password, cpassword } = req.body;

    if (!username || !email || !password || !cpassword) {
        res.status(422).json({ error: "fill the data!!" })
        console.log("No data available!!");
    }
    try {
        const preuserEmail = await USER.findOne({ email: email });

        if (preuserEmail) {
            res.status(422).json({ error: "this email already used!!" })
            console.log("this email already used!!");

        } else if (password !== cpassword) {
            res.status(422).json({ error: "retype password not match!!" })
            console.log("retype password not match!!");

        } else {
            const finalUser = new USER({
                username, email, password, cpassword
            })
            const storedata = await finalUser.save();
            console.log(storedata);
            res.status(201).json(storedata);
            console.log("data stored successfully!!");
        }


    } catch (error) {
        console.log(error);

    }

})


// login user api
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the data!" })
    }
    try {
        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin);

        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);

            // token generate
            const token = await userlogin.generateAuthtoken();
            console.log(token);

            //generate cookie
            res.cookie("CHATGPT", token, {
                expires: new Date(Date.now() + 1440000),
                httpOnly: true
            })

            if (!isMatch) {
                res.status(400).json({ error: "password incorrect!" })
            } else {
                res.status(200).json(userlogin);
            }
        } else {
            res.status(400).json({ error: "invalid details!" })
        }

    } catch (error) {
        res.status(400).json({ error: "invalid details!" })

    }

});

// USERDETAIL
router.get("/validuser", Authenticate, async (req, res) => {
    try {
        const validUserOne = await USER.findOne({ _id: req.userID });
        
        res.status(201).json(validUserOne);
    } catch (error) {
        console.log(error);
    }
});

// LOGOUT USER
router.get("/logout", Authenticate, (req, res) => {
    try {
        req.rootUser.tokens = [];

        res.clearCookie("CHATGPT",{path:"/home"});

        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("User Logout");
         


    } catch (error) {
        console.log(error);

    }

});


// PARAGRAPH GENERATION
router.post("/paragraph", async (req, res) => {
    try {
        const { text } = req.body

        const { data } = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `write a detail paragraph about \n${text}`,
            max_tokens: 800,
            temperature: 0.5,
        });
        if (data) {
            if (data.choices[0].text) {
                // console.log(data.choices[0].text)
                return res.status(200).json(data.choices[0].text);
            }
        } else {
            console.log('data not found 🙂');
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: error.message })
    }
}
)

// TEXT GENERATION
router.post("/summary", async (req, res) => {
    try {
        const { text } = req.body

        const { data } = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Summarize this text \n${text}`,
            max_tokens: 500,
            temperature: 0.5,
        });
        if (data) {
            if (data.choices[0].text) {
                // console.log(data.choices[0].text)
                return res.status(200).json(data.choices[0].text);
            }
        } else {
            console.log('data not found 🙂');
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: error.message })
    }
}
)


// OPEN AI CHATBOT
router.post("/chatbot", async (req, res) => {
    try {
        const { text } = req.body

        const { data } = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Answer question similar to how op 🕴 from star war would.
            Me : 'what is your name?'
            op 🕴 : 'op is my name.'
            Me : ${text}`,
            max_tokens: 300,
            temperature: 0.7,
        });
        if (data) {
            if (data.choices[0].text) {
                // console.log(data.choices[0].text)
                return res.status(200).json(data.choices[0].text);
            }
        } else {
            console.log('data not found 🙂');
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: error.message })
    }
}
)

//CODE CONVERT TO JAVASCRIPT
router.post("/js-converter", async (req, res) => {
    try {
        const { text } = req.body

        const { data } = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: `/* convert these instruction into javascript code \n${text}`,
            max_tokens: 1000,
            temperature: 0.25,
        });
        if (data) {
            if (data.choices[0].text) {
                // console.log(data.choices[0].text)
                return res.status(200).json(data.choices[0].text);
            }
        } else {
            console.log('data not found 🙂');
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({ message: error.message })
    }
}
)

//GENERATE SCIFI-IMAGE
router.post("/scifi-image", async (req, res) => {
    try {
        const { text } = req.body;
        const { data } = await openai.createImage({
            prompt: `generate a scifi image of ${text}`,
            n: 1,
            size: "512x512",
            
        });
        if (data) {
            if (data.data[0].url) {
                return res.status(200).json(data.data[0].url);
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(404).json({
            message: err.message,
        });
    }
})








module.exports = router;



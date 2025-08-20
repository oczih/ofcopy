

async function sendSimpleMessage() {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.API_KEY || "bb2ef10ab4843a5e7ae3d238dfd0de92-97129d72-fa39eccf",
      // When you have an EU-domain, you must specify the endpoint:
      url: "https://api.eu.mailgun.net"
    });
    try {
      const data = await mg.messages.create("mg.fanslio.com", {
        from: "Mailgun Sandbox <postmaster@mg.fanslio.com>",
        to: ["Arvo Matilainen <support@fanslio.com>"],
        subject: "Hello Arvo Matilainen",
        text: "Congratulations Arvo Matilainen, you just sent an email with Mailgun! You are truly awesome!",
      });
  
      console.log(data); // logs response data
    } catch (error) {
      console.log(error); //logs any error
    }
  }


  sendSimpleMessage()
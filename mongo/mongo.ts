import {MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://raymondmcoding:Jonny1040@cluster0.im6apum.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function connectMongo(){
    try{
        //verbinden met mongodb
        await client.connect();
        console.log("connected to mongoDB");
        return client;
    }
    catch (e){
        console.error(e);
    }
    finally{
        await client.close();
    }
};
connectMongo();

export {client, connectMongo};
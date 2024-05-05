import {MongoClient} from "mongodb";

const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority";
const client = new MongoClient(uri);

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
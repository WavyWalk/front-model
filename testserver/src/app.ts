import express from 'express';
import { Router } from './router'
import {WebpackStatsInfo} from "./assetsmanagement/WebpackStatsInfo";
import cookieParser from "cookie-parser"
import cors from 'cors'

export class App {

    static init(port = 3000) {
        const app = express()
        WebpackStatsInfo.readAndAssignStats()
        app.set('view engine', 'pug')
        app.disable('x-powered-by')
        app.use(express.json())
        app.use(cors({
            origin: (requestOrigin, callBack)=>{
                callBack(null, true)
            },
            credentials: true
        }))
        app.use(cookieParser())
        Router.setRoutes(app)
        app.listen(port)
    }

}
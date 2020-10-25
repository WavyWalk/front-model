import { PROJECT_DIR } from './index';
import express from "express"
import {WebpackStatsInfo} from "./assetsmanagement/WebpackStatsInfo";
import cors from 'cors'

export class Router {
    
    static setRoutes(app: express.Application) {
        app.use('/public', express.static(`${PROJECT_DIR}/public`))
        const apiRouter = express.Router({mergeParams: true})


        apiRouter.post('/create', (req, res) => {
            res.send(req.body)
        })

        apiRouter.post('/echo',(req, res) => {
            res.send(req.body)
        })

        apiRouter.get('/user/1', (req, res)=>{
            res.send({name: "joe", account: {email: 'doe'}})
        })

        apiRouter.get('/requestHeaders', (req, res)=>{
            res.send(req.headers)
        })

        apiRouter.get('/cookiePut', (req, res) => {
            const name = req.query.name
            const value = req.query.value
            res.cookie(name, value, {httpOnly: true})
            res.send({name, value})
        })

        apiRouter.get('/cookies', (req, res) => {
            res.send(req.cookies ?? {})
        })

        app.use('/api', apiRouter)
        app.get("*", (req, res) => {
            res.render(`${PROJECT_DIR}/public/index`, {
                pathToCssIndex: WebpackStatsInfo.pathToCssIndex,
                pathToJsIndex: WebpackStatsInfo.pathToJsIndex,
            })
        })
    }

}


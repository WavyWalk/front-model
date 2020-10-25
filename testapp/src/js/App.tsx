import { AppComponent } from './components/AppComponent';
import * as React from 'react'
import ReactDom from 'react-dom'


export class App {

    static init() {
        document.addEventListener('DOMContentLoaded', ()=>{
            this.mount()
        })
    }

    static mount() {
        const mountElement = document.querySelector('#app')
        ReactDom.render(
            <AppComponent/>,
            mountElement
        )
    }
 
}
import * as React from 'react'
import {Button, Container} from 'reactstrap'
import mocha from 'mocha'
import {tests} from "../tests/tests"

const runTest = () => {
    mocha.setup('bdd')
    tests()
    mocha.run()
}

export const AppComponent: React.FC = () => {

    return <div>
        <Button
            onClick={runTest}
        >
            run tests!
        </Button>
        <div id="mocha">

        </div>
    </div>
}



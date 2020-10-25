import { App } from './app';
import path from 'path'

export const PROJECT_DIR = path.resolve(__dirname, '../')

const port = process.argv?.[2] ?? 3000

App.init(port as any)


const chalk = require('chalk')
const inquirer = require('inquirer')
const fs = require('fs')

operation()

function operation(){
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }])
    .then((answer) => {
        const action = answer['action']
        if(action === 'Criar Conta'){
            createAccount()
        }
        else if(action === 'Consultar Saldo'){
            consultar()
        }
        else if(action === 'Depositar'){
            deposit()
        }
        else if(action === 'Sacar'){
            saque()
        }
        else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Sistema encerrado!'))
            process.exit()
        }
    })
    .catch((err) => {
        console.log(err)
    })
}

function createAccount(){
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite o nome da sua conta:'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Essa conta já existe!'))
            return buildAccount()
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => {
            console.log(err)
        })

        console.log(chalk.bgGreen.black('Parabéns! Sua conta foi criada com sucesso.'))
        operation()
    })
    .catch((err) => {
        console.log(err)
    })
}

function consultar(){
    if(!fs.existsSync('accounts')){
        console.log(chalk.bgRed.black('Por favor crie uma conta primeiro!'))
        return operation()
    }
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite o nome da sua conta:'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return consultar()
        }

        const accountData = getAccount(accountName)
        console.log(chalk.bgGreen.black(`Seu saldo é de R$${accountData.balance}`))
        operation()
    })
    .catch((err) => {
        console.log(err)
    })
}

function deposit(){
    if(!fs.existsSync('accounts')){
        console.log(chalk.bgRed.black('Por favor crie uma conta primeiro!'))
        return operation()
    }
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite o nome da sua conta:'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return deposit()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja depositar?'
        }])
        .then((answer) => {
            const amount = answer['amount']
            addAmount(accountName, amount)
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.log(err)
    })
}

function saque(){
    if(!fs.existsSync('accounts')){
        console.log(chalk.bgRed.black('Por favor crie uma conta primeiro!'))
        return operation()
    }
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite o nome da sua conta:'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)){
            return saque()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja sacar?'
        }])
        .then((answer) => {
            const amount = answer['amount']
            sacarAmount(accountName, amount)
        })
        .catch((err) => {
            console.log(err)
        })
    })
    .catch((err) => {
        console.log(err)
    })
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Essa conta não existe! Escolha outro nome'))
        return false
    }
    return true
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro! Tente novamente'))
        return deposit()
    }
    accountData.balance = parseFloat(accountData.balance) + parseFloat(amount)
    
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )
    console.log(chalk.bgGreen.black(`Foi depositado o valor de R$${amount} na sua conta!`))
    operation()
}

function sacarAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro! Tente novamente'))
        return saque()
    }
    if(amount > accountData.balance){
        console.log(chalk.bgRed.black('Saldo insuficiente!'))
        return saque()
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err){
            console.log(err)
        }
    )
    console.log(chalk.bgGreen.black(`Foi sacado o valor de R$${amount} da sua conta!`))
    operation()
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })
    return JSON.parse(accountJSON)
}
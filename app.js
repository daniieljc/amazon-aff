const puppeteer = require('puppeteer');
const captcha = require('@infosimples/node_two_captcha');
const fs = require('fs');
const readline = require('readline');
const colors = require('colors')
const proxy = require('puppeteer-page-proxy');

const tagAmazon = 'id-aff'

captcha_client = new captcha('api-key', {
    timeout: 60000,
    polling: 5000,
    throwErrors: false
});

(async () => {
    accounts = fs.createReadStream('accounts.txt')
    account = [];

    rl = readline.createInterface({
        input: accounts
    })

    for await (const line of rl) {
        account.push(line.split(';'))
    }

    for (i = 0; i < account.length; i++) {
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--disable-web-security',
                '--no-sandbox',
                '--disabled-setupid-sandbox'
            ]
        });
        const page = await browser.newPage();
        //await proxy(page, 'http://159.69.66.224:8080')
        await page.goto('https://www.amazon.es/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.es%2F%3Fref_%3Dnav_custrec_signin&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=esflex&openid.mode=checkid_setup&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&');

        await page.type('#ap_email', account[i][0])
        await page.click('#continue')
        await page.waitForTimeout(1500)
        await page.type('#ap_password', account[i][1])
        await page.click('#signInSubmit')

        await page.waitForTimeout(3000)

        //BODAS
        try {
            await page.goto(`http://www.amazon.es/wedding?tag=${tagAmazon}`)
            await page.waitForTimeout(1500)
            await page.click('.wedding-hero__cta')
            await page.waitForTimeout(1500)

            await page.type("input[name*='firstNamePartner1']", 'Rafael')
            await page.type("input[name*='surnamePartner1']", 'Mireles')

            await page.type("input[name*='firstNamePartner2']", 'Rayan')
            await page.type("input[name*='surnamePartner2']", 'Zayas')

            await page.select("#wr-cm-event-date-month", '8')
            await page.select("#wr-cm-event-date-day", '8')
            await page.select("#wr-cm-event-date-year", '2023')

            await page.type("input[name*='weddingCity']", 'Sevilla')

            await page.type("#wr-cm-event-guests-number", '120')

            imageCatpcha = await page.evaluate(() => {
                return document.getElementById('wr-cr-captcha-image').src
            })

            resolveCaptcha = captcha_client.decode({
                url: imageCatpcha
            }).then(function (response) {
                return response
            });

            await page.type('#wr-cr-captcha-input-box', (await resolveCaptcha).text)

            var createButton = await page.$x('//*[@id="a-autoid-11"]/span/input')
            await page.waitForTimeout(1000)
            await createButton[0].click()

            await page.waitForTimeout(1500)
            await page.screenshot({path: `${account[i][0]}.png`})

            console.log('SUCCESS ' + account[i][0].green)
        } catch (e) {
            console.log(`${e} - ${account[i][0]}`.red)
        }

        //NACIMIENTO
        /*try {
            await page.goto('https://www.amazon.es/baby-reg/homepage?tag=daniieljc-21')
            await page.waitForTimeout(1500)
            await page.click('#a-autoid-4-announce')
            await page.waitForTimeout(1500)

            await page.select("#arrivalDate-d-native", '14')
            await page.select("#arrivalDate-m-native", '9')
            await page.select("#arrivalDate-y-native", '2021')

            await page.select('#address-list > option:nth-child(2)')
            //await page.select("#address-list", '2021')

            imageCatpcha = await page.evaluate(() => {
                return document.getElementById('br-captcha-image').src
            })

            resolveCaptcha = captcha_client.decode({
                url: imageCatpcha
            }).then(function (response) {
                return response
            });

            await page.type('#captcha-solution', (await resolveCaptcha).text)
            await page.waitForTimeout(1000)
            await page.click('#a-autoid-0-announce')

            await page.waitForTimeout(1000)
            await page.screenshot({path: `${account[i][0]}.png`})

            console.log('SUCCESS ' + account[i][0].green)
        } catch (e) {
            console.log(`${e} - ${account[i][0]}`.red)
        }*/

        await browser.close();
    }
})();

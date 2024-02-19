require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { Bot, Keyboard, GrammyError, HttpError, InlineKeyboard, InputFile} = require('grammy');
//const { Menu } = require("@grammyjs/menu");
const { Table , Point, Answer} = require('./utils');
const data = require('./data.json');




const bot = new Bot(process.env.API_TG);
bot.command('start', async ctx => {
    const startCommand = new Keyboard().text('Таблицы').text('Файлы').row().text('Точки').text('Прочее').resized();
    await ctx.reply('Привет! Это бот Coffee Like NN, выбери команду в списке!', {
        reply_markup: startCommand
    });
});


bot.hears(['Таблицы','Файлы','Точки','Прочее'],  async ctx =>{
    let enter;
    const lowerTable = ctx.message.text.toLowerCase();
    const jsonData = Table(lowerTable);
     let inKey;
    switch (lowerTable) {
        case 'таблицы':
            enter = jsonData.map(el => {
                return [InlineKeyboard.url(el.name ,el.link)];
            });
            inKey = InlineKeyboard.from(enter);
            await ctx.reply("Здесь собраны все таблицы, которые необходимы тебе для работы!", {
                reply_markup: inKey
            });
        
            break;
        
        case 'точки':
            await ctx.reply("Введите название точки сети Coffee Like в Нижнем Новгороде.\nНапример: Ошара, ЖП, Г4");

            break;

        case 'файлы':
            //await ctx.replyWithDocument(new InputFile("./files/обучение обучаторов.pdf")); 
            const pathToDir = './files/ttk';
            //проверяем с помощью метода существование папки
            if (fs.existsSync(pathToDir)) {
                //получаем с помощью метода название всех файлов находящихся в папке в виде массива
                const allFiles = fs.readdirSync(pathToDir).slice(1);
                
                console.log(allFiles);
                await ctx.reply("Подождите,загружаю...");
                for (let i = 0; i < allFiles.length; i++) {          
                    await ctx.replyWithDocument(new InputFile(`${pathToDir}/${allFiles[i]}`));
               }
            }else{
                await ctx.reply("Ой..Произшла ошибка. Обратитесь к старшему тренеру бариста!")
            }
            await ctx.reply("Все актуальные файлы выгружены!");

            break;
        
        case 'прочее':
            // await ctx.reply("Я так понимаю, гостей нет и у тебя появилась свободная минутка, а возможно ты едешь с работы или на работу и не знаешь, чем заняться?\n\nНу что,выбирай!)", {
            //     reply_markup: {remove_keyboard: true}
            // });
            const startNewCommands = new Keyboard().text("Desk").text("Тест").text("Назад").resized();
            ctx.reply("Нужен логин и пароль от Desk или хочеть пройти тест?",{
                reply_markup: startNewCommands
            });
            
            break;
        default:
            break;
    }
   
    

});

bot.hears(['Desk', 'Тест', 'Назад'], async ctx =>{
    const startCommand = new Keyboard().text('Таблицы').text('Файлы').row().text('Точки').text('Прочее').resized();
    if (ctx.message.text === 'Desk') {

        await ctx.reply(`Для Владимира и Нижнего Новгорода.\nЛогин: ${process.env.LOGO_DESK}\nПароль: ${process.env.PASS_DESK}`);
    }
    if (ctx.message.text === 'Тест') {
       await ctx.reply('Тест содержит 20 основных вопросов!');
        const answer = Answer();
        
       
        const btnRows = answer.options.map((option) =>{
            return [InlineKeyboard.text(
              option.text, JSON.stringify({
                type: 'answer',
                isCorrect: option.isCorrect,
                queID: answer.id}))]});
        const inlineKey = InlineKeyboard.from(btnRows);
        ctx.reply(answer.text, {
            reply_markup: inlineKey
        });
        
        
        
   
        

    }
    if (ctx.message.text === 'Назад') {
        await ctx.reply("Выберите команду в списке.", {
            reply_markup: startCommand
        });
    }
    
});

//получаем кнопку ответа на тест
bot.on('callback_query:data', async ctx =>{
        const answer = Answer();
        const callBackData = JSON.parse(ctx.callbackQuery.data);
        console.log(callBackData);
        console.log(answer);
        if(callBackData.isCorrect){
            await ctx.reply('Правильно!');
            const btnRows = answer.options.map((option) =>{
                return [InlineKeyboard.text(
                  option.text, JSON.stringify({
                    type: 'answer',
                    isCorrect: option.isCorrect,
                    queID: answer.id}))]});
            const inlineKey = InlineKeyboard.from(btnRows);
            ctx.reply(answer.text, {
                reply_markup: inlineKey
            });
            await ctx.answerCallbackQuery();
        }else{
            await ctx.reply('Попробуй еще раз!');
            await ctx.answerCallbackQuery();
        }
} );

//получаем название точки
bot.on('message', async ctx =>{
   let stroke;
   const lower = ctx.message.text.toUpperCase();
   const point = Point(lower);
   const pathToDir = './files/img';
   const allFiles = fs.readdirSync(pathToDir);
   console.log(point);
   //console.log(point.street);
   //если ввели название точки некорректно
   if (point == undefined) {
        stroke = 'Не удалось найти! Возможно вы ввели название некорректно, попробуйте еще раз!';
        await ctx.reply(stroke, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        return;
   }
   //когда ввели корректно, но нужно проверить есть ли фотография в папке, если нет, то отправить без фото
   for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i] === `${point.nik[0]}.jpg`) {
        if (point.invoices === undefined) {
            stroke = `Название: ${point.nik[0]}\nАдрес: ${point.street}\nРабочий чат: ${point.chat}`;
        }else{
            stroke = `Название: ${point.nik[0]}\nАдрес: ${point.street}\nРабочий чат: ${point.chat}\nЧат с накладными: ${point.invoices}`;
        }
        await ctx.replyWithPhoto(new InputFile(`./files/img/${allFiles[i]}`), {
            caption: stroke,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });
        return;
    }
    
   }
    if (point.invoices === undefined) {
        stroke = `Название: ${point.nik[0]}\nАдрес: ${point.street}\nРабочий чат: ${point.chat}`;
    }else{
        stroke = `Название: ${point.nik[0]}\nАдрес: ${point.street}\nРабочий чат: ${point.chat}\nЧат с накладными: ${point.invoices}`;
}

    await ctx.reply(stroke, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
    });
   
});


bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
  });


bot.start();
const data = require('./data.json');

const Table = (topic) =>{
    const dataTopic = data[topic];
    //console.log(dataTopic);
    return dataTopic;
};


const Point = (searchName) =>{
    
    const dataObj = data['точки'];
    const point = dataObj.find(el =>{
    //    for (let i = 0; i < el.nik.length; i++) {
    //     console.log(el.nik[i]);
    //      if (el.nik[i] == searchName) {
    //         console.log(5);
    //         return el;
    //      }else{
    //         return undefined;
    //      }
        
    //    }
        const data  = el.nik.find(elem => {
            if (elem === searchName) {
                //console.log(elem);
                return el;
                
            }
        });

        return data;
    })
    //console.log(point);
   
    
    return point;
        
};

const Answer = () =>{
    //const lower = data['answer'];
    const dataAnswer = data['answer'];
    const dataAnswerIndex = Math.floor(Math.random() * data['answer'].length);
    console.log(dataAnswerIndex);
    const answer = dataAnswer.find(el => {
        return el.id === dataAnswerIndex
    });
    
    return answer;
}

module.exports = { Table, Point ,Answer};
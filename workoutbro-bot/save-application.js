// Функция для сохранения заявки в файл
const fs = require('fs');
const path = require('path');

function saveApplication(userId, username, answers) {
  const application = {
    id: Date.now(),
    userId: userId,
    username: username,
    timestamp: new Date().toISOString(),
    answers: answers
  };
  
  const filePath = path.join(__dirname, 'applications.json');
  
  try {
    let applications = [];
    if (fs.existsSync(filePath)) {
      applications = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    
    applications.push(application);
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));
    
    console.log(`Application saved: ${application.id}`);
    return application.id;
  } catch (error) {
    console.error('Error saving application:', error);
    return null;
  }
}

module.exports = { saveApplication };


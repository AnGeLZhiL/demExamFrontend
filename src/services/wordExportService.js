// src/services/wordExportService.js

export class WordExportService {
  
  /**
   * Подготовить данные участников
   */
  prepareParticipantsData(users, accounts) {
    return users
      .filter(user => {
        const account = accounts.find(acc => acc.user_id === user.id)
        return account && account.role?.name?.toLowerCase().includes('участник')
      })
      .map(user => {
        const account = accounts.find(acc => acc.user_id === user.id)
        const fullName = `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.trim()
        const login = account?.login || `user_${user.id}`
        
        return {
          id: user.id,
          fullName,
          login,
          password: account?.password_plain || account?.password || 'не установлен',
          seatNumber: account?.seat_number || '',
          group: user.group?.number || ''
        }
      })
      .sort((a, b) => {
        const seatA = a.seatNumber ? parseInt(a.seatNumber) : 99999
        const seatB = b.seatNumber ? parseInt(b.seatNumber) : 99999
        return seatA - seatB || a.fullName.localeCompare(b.fullName)
      })
  }
  
  /**
   * Создать Word документ
   */
  async createParticipantsDocument(event, participants) {
    try {
      // Создаем HTML для Word
      const html = this.generateSimpleHTML(event, participants)
      
      // Создаем Blob
      const blob = new Blob([html], { 
        type: 'application/msword'
      })
      
      // Имя файла
      const fileName = `Участники_${this.sanitizeFileName(event.name)}_${new Date().toISOString().slice(0, 10)}.doc`
      
      return { blob, fileName }
      
    } catch (error) {
      console.error('Ошибка создания документа:', error)
      throw error
    }
  }
  
  /**
   * Генерация простого HTML для Word
   */
  generateSimpleHTML(event, participants) {
    const now = new Date().toLocaleString('ru-RU')
    const eventDate = new Date(event.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Настройки системы
    const gogsUrl = 'https://gogs.exam.local' // ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ URL
    const dbHost = 'localhost' // ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ ХОСТ
    const dbPort = '5432'
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Данные участников</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 2cm;
          font-size: 12pt;
          line-height: 1.5;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px;
        }
        .event-title {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .event-info {
          color: #666;
          font-size: 11pt;
          margin-bottom: 3px;
        }
        .card {
          border: 1px solid #000;
          margin: 20px 0;
          padding: 20px;
          page-break-inside: avoid;
        }
        .card-header {
          font-weight: bold;
          font-size: 14pt;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ccc;
        }
        .field {
          margin-bottom: 8px;
        }
        .field-label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        .db-info {
          margin: 10px 0 5px 0;
          padding: 10px;
          background: #f5f5f5;
          font-family: 'Courier New', monospace;
          font-size: 11pt;
          border-left: 3px solid #000;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
    
    <!-- Заголовок -->
    <div class="header">
      <div class="event-title">${event.name}</div>
      <div class="event-info">Дата проведения: ${eventDate}</div>
      <div class="event-info">Количество участников: ${participants.length}</div>
      <div class="event-info">Создано: ${now}</div>
    </div>
    `
    
    // Карточки участников
    participants.forEach((participant, index) => {
      const dbName = `exam_${participant.login}`
      
      html += `
      <div class="card">
        <div class="card-header">
          ${participant.fullName}
          ${participant.seatNumber ? ` | Место: ${participant.seatNumber}` : ''}
        </div>
        
        <div class="field">
          <span class="field-label">Логин:</span> ${participant.login}
        </div>
        
        <div class="field">
          <span class="field-label">Пароль:</span> ${participant.password}
        </div>
        
        ${participant.group ? `
        <div class="field">
          <span class="field-label">Группа:</span> ${participant.group}
        </div>` : ''}
        
        <div class="field">
          <span class="field-label">Git:</span> ${gogsUrl}
        </div>
        
        <div class="db-info">
          База данных: ${dbName}<br>
          Пользователь: ${participant.login}<br>
          Хост: ${dbHost}<br>
          Порт: ${dbPort}
        </div>
        
        <div class="db-info">
          psql -h ${dbHost} -p ${dbPort} -U ${participant.login} -d ${dbName}
        </div>
      </div>`
      
      // Разрыв страницы после каждых 4 карточек
      if ((index + 1) % 4 === 0 && index !== participants.length - 1) {
        html += '<div class="page-break"></div>'
      }
    })
    
    html += `</body></html>`
    
    return html
  }
  
  /**
   * Очистить имя файла
   */
  sanitizeFileName(name) {
    return name
      .replace(/[<>:"/\\|?*]+/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 50)
  }
}

// Создаем и экспортируем экземпляр класса
const wordExportService = new WordExportService()
export default wordExportService
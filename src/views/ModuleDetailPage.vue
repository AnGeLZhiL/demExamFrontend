<template>
  <main class="module-detail-page">
    <!-- Хлебные крошки и навигация -->
    <header class="page-header">
      <nav class="breadcrumb">
        <button @click="goBack" class="breadcrumb-back">
          ← Назад
        </button>
        <span class="breadcrumb-separator">/</span>
        <router-link :to="`/events/${module?.event_id}`" class="breadcrumb-link">
          {{ module?.event?.name || 'Мероприятие' }}
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Модуль</span>
      </nav>
      
      <div class="header-main">
        <div class="header-left">
          <h1 class="module-title">{{ module?.name || 'Загрузка...' }}</h1>
          <div class="module-meta">
            <span class="module-id">ID: {{ moduleId }}</span>
            <span class="module-date">
              Создан: {{ formatDate(module?.created_at) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="module-status-management" v-if="module">
        <button 
          v-if="module.status_id === 6"
          @click="activateEntireModule"
          class="action-btn activate-module-btn"
          :disabled="togglingEntireModule"
          title="Активировать модуль (разблокировать все БД и репозитории)"
        >
          <span v-if="togglingEntireModule">
            <span class="loading-dots">
              <span></span><span></span><span></span>
            </span>
            Активация...
          </span>
          <span v-else>
            🚀 Активировать модуль
          </span>
        </button>
        
        <button 
          v-else
          @click="deactivateEntireModule"
          class="action-btn deactivate-module-btn"
          :disabled="togglingEntireModule"
          title="Отключить модуль (заблокировать все БД и репозитории)"
        >
          <span v-if="togglingEntireModule">
            <span class="loading-dots">
              <span></span><span></span><span></span>
            </span>
            Отключение...
          </span>
          <span v-else>
            ⛔ Отключить модуль
          </span>
        </button>
      </div>
      
      <!-- Информационная панель -->
      <div class="info-panel">
        <div class="info-card">
          <div class="info-label">Статус</div>
          <div class="info-value">
            <span class="status-badge" :class="getStatusClass(module?.status_id)">
              {{ module?.status?.name || '—' }}
            </span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-label">Мероприятие</div>
          <div class="info-value">
            <router-link 
              v-if="module?.event" 
              :to="`/events/${module.event_id}`"
              class="event-link"
            >
              {{ module.event.name }}
            </router-link>
            <span v-else>—</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-label">Обновлен</div>
          <div class="info-value">
            {{ formatDate(module?.updated_at) }}
          </div>
        </div>
      </div>
    </header>

    <!-- Контент модуля с табами -->
    <div class="module-content">
      <!-- Вкладки -->
      <div class="tabs">
        <button 
          @click="handleTabChange('overview')" 
          class="tab-btn" 
          :class="{ active: activeTab === 'overview' }"
        >
          📋 Обзор
        </button>
        <button 
        @click="handleTabChange('databases')" 
        class="tab-btn" 
        :class="{ active: activeTab === 'databases' }"
      >
        🗄️ Базы данных
      </button>
        <button 
          @click="activeTab = 'repositories'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'repositories' }"
        >
          💾 Репозитории
        </button>
        <button @click="handleTabChange('experts')" class="tab-btn" :class="{ active: activeTab === 'experts' }">
          👨‍🏫 Эксперты
        </button>
        <button 
          @click="activeTab = 'settings'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'settings' }"
        >
          ⚙️ Настройки
        </button>
      </div>

      <!-- Содержимое вкладок -->
      <div class="tab-content">
        <!-- Вкладка "Обзор" -->
        <div v-if="activeTab === 'overview'" class="overview-tab">
            <div class="overview-section">
            <h3>📊 Статистика модуля</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🗄️</div>
                <div class="stat-value">0</div>
                <div class="stat-label">Базы данных</div>
                <button class="stat-action">Добавить</button>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💾</div>
                <div class="stat-value">0</div>
                <div class="stat-label">Репозитории</div>
                <button class="stat-action">Добавить</button>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🖥️</div>
                <div class="stat-value">0</div>
                <div class="stat-label">Серверы</div>
                <button class="stat-action">Добавить</button>
              </div>
              <!-- <div class="stat-card">
                <div class="stat-icon">🔧</div>
                <div class="stat-value">4</div>
                <div class="stat-label">Настроек</div>
                <button class="stat-action" @click="activeTab = 'settings'">Настроить</button>
              </div> -->
            </div>
          </div>

          <div class="overview-section">
            <h3>Активность модуля</h3>
            <div class="activity-timeline">
              <div class="activity-item" v-if="module?.created_at">
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-time">{{ formatDateTime(module.created_at) }}</div>
                  <div class="activity-text">Модуль создан</div>
                </div>
              </div>
              <div class="activity-item" v-if="module?.updated_at && module.updated_at !== module.created_at">
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-time">{{ formatDateTime(module.updated_at) }}</div>
                  <div class="activity-text">Модуль обновлен</div>
                </div>
              </div>
              <div class="activity-placeholder" v-if="!module?.created_at">
                <p>Нет данных об активности</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Вкладка "Базы данных" -->
  <div v-else-if="activeTab === 'databases'" class="databases-tab">
    <div class="section-header">
      <h3>🗄️ Базы данных PostgreSQL</h3>
      <h4>📝 Создать БД для конкретного участника</h4>
      <div class="single-create-form">
        <select 
          v-model="selectedParticipantId" 
          class="participant-select"
          :disabled="creatingSingleDatabase"
        >
          <option value="">Выберите участника...</option>
          <option 
            v-for="participant in availableParticipants" 
            :key="participant.id" 
            :value="participant.id"
          >
            {{ participant.name }}
            <span v-if="participant.seat_number">(Место {{ participant.seat_number }})</span>
          </option>
        </select>
        
        <button 
          @click="createSingleDatabase()"
          class="action-btn single-create-btn"
          :disabled="!selectedParticipantId || creatingSingleDatabase"
        >
          <span v-if="creatingSingleDatabase" class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          <span v-else>Создать БД</span>
        </button>
        
        <div v-if="singleDatabaseError" class="error-message">
          ❌ {{ singleDatabaseError }}
        </div>
      </div>
      <div class="bulk-actions">
        <button 
          @click="loadDatabases" 
          class="action-btn"
          :disabled="loadingDatabases"
        >
          <span v-if="loadingDatabases" class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          <span v-else>Обновить</span>
        </button>

        <button 
          @click="syncDatabases" 
          class="action-btn sync-btn"
          :disabled="creatingDatabases"
          title="Создает БД для новых участников и обновляет для существующих"
        >
          <span v-if="creatingDatabases" class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          <span v-else>🚀 Синхронизировать БД</span>
        </button>
        <button 
          @click="confirmDropAllDatabases" 
          class="action-btn danger-btn"
          :disabled="droppingAllDatabases || databases.length === 0"
          title="Удалить ВСЕ базы данных модуля"
          style="background-color: #dc2626; border-color: #dc2626; color: white;"
        >
          <span v-if="droppingAllDatabases" class="loading-dots">
            <span></span><span></span><span></span>
          </span>
          <span v-else>⚠️ Удалить ВСЕ БД</span>
        </button>
        <button @click="testConnectionDirectly" class="action-btn test-btn">
          Тест подключения
        </button>
        <div class="password-bulk-actions">
          <!-- ... другие кнопки ... -->
          
          <button 
            @click="lockAllDatabases"
            class="action-btn small-btn danger-btn"
            :disabled="lockingDatabase || !hasActiveDatabases"
            title="Заблокировать все БД (только чтение)"
          >
            🔒 Заблокировать все
          </button>
          
          <button 
            @click="unlockAllDatabases"
            class="action-btn small-btn success-btn"
            :disabled="lockingDatabase || !hasLockedDatabases"
            title="Разблокировать все БД"
          >
            🔓 Разблокировать все
          </button>
        </div>
        
        </div>
    </div>

    <!-- Статус -->
    <div v-if="loadingDatabases" class="loading">
      <div class="empty-icon">🔄</div>
      <h3>Загрузка баз данных...</h3>
      <p>Пожалуйста, подождите</p>
    </div>

    <div v-else-if="databasesError" class="error">
      <div class="empty-icon">❌</div>
      <h3>Ошибка загрузки</h3>
      <p>{{ databasesError }}</p>
      <button @click="loadDatabases" class="retry-btn">
        Попробовать снова
      </button>
    </div>

    <div v-else-if="databases.length === 0" class="empty">
      <div class="empty-icon">🗄️</div>
      <h3>Базы данных не найдены</h3>
      <p>Создайте PostgreSQL базы данных для участников мероприятия</p>
      <button @click="createAllDatabases" class="primary-btn" :disabled="creatingDatabases">
        <span v-if="creatingDatabases" class="loading-dots">
          <span></span><span></span><span></span>
        </span>
        <span v-else>Создать все базы данных</span>
      </button>
    </div>

    <div v-else class="databases-list">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{{ databases.length }}</span>
          <span class="stat-label">Всего БД</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ activeDatabasesCount }}</span>
          <span class="stat-label">Активных</span>
        </div>
        <!-- <div class="stat-item">
          <span class="stat-value">{{ emptyDatabasesCount }}</span>
          <span class="stat-label">Пустых</span>
        </div> -->
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Название базы</th>
              <th>Пользователь</th>
              <th>Пароль</th> <!-- ДОБАВЬТЕ ЭТОТ ЗАГОЛОВОК! -->
              <th>Место</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="db in databases" :key="db.id">
              <td>
                <code class="code-highlight">{{ db.name }}</code>
              </td>
              <td>
                <code class="code-highlight">{{ db.username }}</code>
              </td>
              <td>
                <div class="password-cell">
                  <code class="password-display">
                    {{ visiblePasswords[db.id] ? db.password : '••••••••' }}
                  </code>
                  <button 
                    @click="togglePasswordVisibility(db.id)"
                    class="password-toggle-btn"
                    :title="visiblePasswords[db.id] ? 'Скрыть пароль' : 'Показать пароль'"
                  >
                    <span v-if="visiblePasswords[db.id]">👁️</span>
                    <span v-else>👁️‍🗨️</span>
                  </button>
                  <button 
                    @click="copyPassword(db.password)" 
                    class="copy-btn"
                    :title="db.password ? 'Скопировать пароль' : 'Пароль недоступен'"
                    :disabled="!db.password"
                  >
                    📋
                  </button>
                </div>
              </td>
              <td>
                <div v-if="db.event_account?.user">
                  <div class="participant-name">{{ db.event_account.user.name }}</div>
                  <div v-if="db.event_account.seat_number" class="seat-badge">
                    {{ db.event_account.seat_number }}
                  </div>
                </div>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span class="status-badge" :class="db.is_active ? 'active' : 'inactive'">
                  {{ db.is_active ? '✅ Активна' : '❌ Отключена' }}
                </span>
              </td>
              <td class="actions-cell">
                <!-- Кнопка блокировки/разблокировки -->
                <button 
                  @click="toggleDatabaseLock(db)"
                  class="action-btn-enhanced"
                  :class="db.is_active ? 'lock-btn' : 'unlock-btn'"
                  :disabled="lockingDatabase"
                  :title="db.is_active ? 'Заблокировать БД (только чтение)' : 'Разблокировать БД'"
                >
                  <span v-if="lockingDatabase">⏳</span>
                  <span v-else>{{ db.is_active ? '🔒' : '🔓' }}</span>
                </button>
                <div class="action-buttons">
                  <!-- Кнопка пересоздать -->
                  <button 
                    @click="recreateDatabase(db)"
                    class="action-btn small-btn refresh-btn"
                    :disabled="recreatingDatabase"
                    title="Пересоздать БД"
                  >
                    🔄
                  </button>
                  <!-- Кнопка удалить -->
                  <button 
                    @click="dropDatabase(db.id, db.name)"
                    class="action-btn small-btn delete-btn"
                    title="Удалить БД"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

        <!-- Вкладка "Репозитории" -->
        <div v-else-if="activeTab === 'repositories'" class="repositories-tab">
  <div class="section-header">
    <h3>Репозитории Git участников</h3>
    <!-- Кнопки массового управления -->
  <div class="bulk-management" v-if="repositories.length > 0">
    <div class="bulk-buttons">
      <button 
        @click="lockAllRepositories"
        class="action-btn lock-all-btn"
        :disabled="bulkActionInProgress || !hasActiveRepositories"
        title="Заблокировать ВСЕ репозитории (только чтение)"
      >
        <span v-if="bulkActionInProgress && bulkActionType === 'lock'">⏳</span>
        <span v-else>🔒 Заблокировать все</span>
      </button>
      
      <button 
        @click="unlockAllRepositories"
        class="action-btn unlock-all-btn"
        :disabled="bulkActionInProgress || !hasLockedRepositories"
        title="Разблокировать ВСЕ репозитории"
      >
        <span v-if="bulkActionInProgress && bulkActionType === 'unlock'">⏳</span>
        <span v-else>🔓 Разблокировать все</span>
      </button>
      
      <div class="bulk-stats">
        <span class="stat-badge active">
          ✅ Активных: {{ activeRepositoriesCount }}
        </span>
        <span class="stat-badge locked">
          🔒 Заблокированных: {{ lockedRepositoriesCount }}
        </span>
      </div>
    </div>
  </div>
    <div class="bulk-actions">
      <button 
        @click="testGogsConnection" 
        class="action-btn test-btn"
        :disabled="testingConnection"
      >
        <span v-if="testingConnection">⏳ Проверка...</span>
        <span v-else>Проверить подключение</span>
      </button>
      
      <button 
          @click="smartCreateOrRecreateRepositories" 
          class="action-btn smart-btn"
          :disabled="smartActionInProgress || !gogsConnected"
          :class="{
            'create-btn': repositories.length === 0,
            'recreate-btn': repositories.length > 0
          }"
          :title="repositories.length === 0 ? 'Создать репозитории' : 'Пересоздать репозитории (удалить старые)'"
        >
          <span v-if="smartActionInProgress">⏳ Обработка...</span>
          <span v-else>
            {{ repositories.length === 0 ? '🚀 Создать все репозитории' : '🔄 Пересоздать все репозитории' }}
          </span>
        </button>
        
        <!-- Создание ОДНОГО репозитория -->
        <div class="single-repo-create">
          <select 
            v-model="selectedParticipantForRepo" 
            class="participant-select"
            :disabled="creatingSingleRepo || !gogsConnected"
          >
            <option value="">Выберите участника...</option>
            <option 
              v-for="participant in availableParticipantsForRepo" 
              :key="participant.id" 
              :value="participant.id"
            >
              {{ participant.name }}
              <span v-if="participant.seat_number">(Место {{ participant.seat_number }})</span>
              <span v-if="participant.hasRepo" style="color: #10b981;">✓ Есть репозиторий</span>
            </option>
          </select>
          
          <button 
            @click="createOrRecreateSingleRepository"
            class="action-btn single-create-btn"
            :disabled="!selectedParticipantForRepo || creatingSingleRepo || !gogsConnected"
            :title="selectedParticipantForRepo && getParticipantRepoStatus(selectedParticipantForRepo) === 'has_repo' ? 'Пересоздать репозиторий' : 'Создать репозиторий'"
          >
            <span v-if="creatingSingleRepo">⏳</span>
            <span v-else>
              {{ selectedParticipantForRepo && getParticipantRepoStatus(selectedParticipantForRepo) === 'has_repo' ? '🔄 Пересоздать' : '➕ Создать' }}
            </span>
          </button>

        </div>
        <button 
          @click="deleteAllRepositories" 
          class="action-btn danger-btn delete-all-btn"
          :disabled="deletingAllRepositories || repositories.length === 0 || !gogsConnected"
          title="Удалить ВСЕ репозитории и пользователей из Gogs"
        >
          <span v-if="deletingAllRepositories">⏳ Удаление...</span>
          <span v-else>🗑️ Удалить все</span>
        </button>
    </div>
  </div>

  <!-- Статус подключения -->
  <div class="connection-status" :class="gogsStatusClass">
    <div class="status-info">
      <span class="status-icon">{{ gogsConnected ? '✅' : '❌' }}</span>
      <span class="status-text">
        {{ gogsConnected ? 'Gogs сервер подключен' : 'Gogs сервер не подключен' }}
      </span>
      <span v-if="gogsConnected" class="mock-badge" title="Режим демонстрации">
        Демо-режим
      </span>
    </div>
    <div v-if="gogsInfo" class="connection-details">
      <small>Версия: {{ gogsInfo.version }} | Статус: {{ gogsInfo.status }}</small>
    </div>
  </div>

  <!-- Таблица репозиториев -->
  <div v-if="loadingRepositories" class="loading-state">
    <div class="spinner"></div>
    <p>Загрузка репозиториев...</p>
  </div>

  <div v-else-if="repositoriesError" class="error-state">
    <p>❌ {{ repositoriesError }}</p>
    <button @click="loadRepositories" class="retry-btn">
      Попробовать снова
    </button>
  </div>

  <div v-else-if="repositories.length === 0" class="empty-state">
    <div class="empty-icon">💾</div>
    <h4>Репозитории не созданы</h4>
    <p>Создайте Git-репозитории для участников мероприятия</p>
    <div class="empty-actions">
      <button 
        @click="createAllRepositories" 
        class="primary-btn"
        :disabled="!gogsConnected"
      >
        🚀 Создать репозитории
      </button>
      <button @click="loadRepositories" class="secondary-btn">
        🔄 Обновить список
      </button>
    </div>
    <div class="empty-hint">
      <p>💡 На предзащите используется <strong>демо-режим</strong>. В реальной системе будут создаваться настоящие Git-репозитории.</p>
    </div>
  </div>

  <div v-else class="repositories-container">
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{{ repositories.length }}</span>
        <span class="stat-label">Всего</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ activeRepositoriesCount }}</span>
        <span class="stat-label">Активных</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ privateRepositoriesCount }}</span>
        <span class="stat-label">Приватных</span>
      </div>
    </div>

    <div class="repositories-table-container">
      <table class="repositories-table">
        <thead>
          <tr>
            <th class="participant-cell-enhanced">Участник</th>
            <th class="repo-name-cell">Репозиторий</th>
            <th class="repo-status">Статус</th>
            <th class="links-cell-enhanced">Ссылки</th>
            <th class="actions-cell-enhanced">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="repo in repositories" :key="repo.id">
            <td class="participant-cell-enhanced">
              <div class="participant-info">
                <div class="participant-name">{{ repo.participant?.name || 'Участник' }}</div>
                <div v-if="repo.participant?.seat_number" class="seat-badge">
                  Место {{ repo.participant.seat_number }}
                </div>
                <div class="participant-login">
                  {{ repo.participant?.login || '—' }}
                </div>
              </div>
            </td>
            <td class="repo-name-cell">
              <div class="repo-info">
                <strong class="repo-name">{{ repo.name }}</strong>
                <div v-if="repo.description" class="repo-description">
                  {{ repo.description }}
                </div>
                <div class="repo-meta">
                  <small>Создан: {{ formatDateTime(repo.created_at) }}</small>
                  <small v-if="repo.updated_at && repo.updated_at !== repo.created_at">
                    Обновлен: {{ formatDateTime(repo.updated_at) }}
                  </small>
                </div>
              </div>
            </td>
            <td class="repo-status">
              <span class="status-badge" :class="repo.status">
                {{ getStatusText(repo.status) }}
                <span v-if="!repo.is_active" class="inactive-indicator">⚠️</span>
              </span>
            </td>
            <td class="links-cell-enhanced">
              <div class="links-group-enhanced">
                <a 
                  :href="repo.url" 
                  target="_blank" 
                  class="link-btn-enhanced web-btn"
                  title="Открыть в браузере"
                >
                  🌐 Веб-интерфейс
                </a>
                <button 
                  v-if="repo.ssh_url"
                  @click="copyToClipboard(repo.ssh_url)"
                  class="link-btn-enhanced ssh-btn"
                  title="Скопировать SSH ссылку"
                >
                  🔗 SSH ссылка
                </button>
                <button 
                  @click="copyToClipboard(repo.clone_url || repo.url + '.git')"
                  class="link-btn-enhanced http-btn"
                  title="Скопировать HTTP ссылку"
                >
                  📋 HTTP ссылка
                </button>
              </div>
            </td>
            <td class="actions-cell-enhanced">
              <div class="actions-group-enhanced">
                <button 
                  @click="toggleRepositoryAccess(repo)"
                  class="action-btn-enhanced"
                  :class="repo.is_active ? 'disable-btn' : 'enable-btn'"
                  :title="repo.is_active ? 'Заблокировать доступ' : 'Разблокировать доступ'"
                >
                  {{ repo.is_active ? '🔒' : '🔓' }}
                </button>
                <button 
                  @click="openRepository(repo)"
                  class="action-btn-enhanced open-btn"
                  title="Открыть репозиторий"
                >
                  📂
                </button>
                <button 
                  @click="recreateSingleRepository(repo)"
                  class="action-btn-enhanced recreate-btn"
                  :disabled="recreatingSingleRepo === repo.id"
                  :title="recreatingSingleRepo === repo.id ? 'Пересоздание...' : 'Удалить и создать заново'"
                >
                  <span v-if="recreatingSingleRepo === repo.id">⏳</span>
                  <span v-else>🔄</span>
                </button>
                <button 
                  @click="deleteRepository(repo)"
                  class="action-btn-enhanced delete-btn"
                  title="Удалить репозиторий"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    
  </div>
</div>

        <div v-if="activeTab === 'experts'" class="experts-tab">
      <div class="section-header">
        <h3>👨‍🏫 Управление экспертами и публичными репозиториями</h3>
        <div class="expert-actions">          
          <button 
            @click="createExpertAccounts" 
            class="action-btn create-expert-btn"
            :disabled="creatingExpertAccounts || !gogsConnected"
          >
            <span v-if="creatingExpertAccounts">⏳</span>
            <span v-else>👨‍🏫 Создать учетные записи экспертов</span>
          </button>
          
          <button 
            @click="createPublicRepository" 
            class="action-btn public-repo-btn"
            :disabled="creatingPublicRepo || !gogsConnected"
          >
            <span v-if="creatingPublicRepo">⏳</span>
            <span v-else>🌐 Создать публичный репозиторий</span>
          </button>
        </div>
      </div>
      
      <!-- Список экспертов -->
      <div class="experts-section">
        <div v-if="expertsLoading" class="loading">
          <div class="spinner"></div>
          <p>Загрузка экспертов...</p>
        </div>
        
        <div v-else-if="expertsError" class="error">
          <p>❌ {{ expertsError }}</p>
          <button @click="loadModuleExperts">Повторить</button>
        </div>
        
        <!-- Важная проверка: experts должен быть массивом -->
        <div v-else-if="Array.isArray(experts) && experts.length > 0" class="experts-table">
          <table>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Роль</th>
                <th>Логин Gogs</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <!-- Проверяем, что expert существует в итерации -->
              <tr v-for="expert in experts" :key="expert.id">
                <td>{{ expert?.name || 'Неизвестно' }}</td>
                <td>{{ expert?.role || 'Эксперт' }}</td>
                <td>
                  <span v-if="expert.has_gogs_account" class="badge success">
                    ✅ {{ expert.login }}
                  </span>
                  <span v-else class="badge warning">
                    ❌ Нет учетной записи
                  </span>
                </td>
                <td>
                  <!-- Добавьте проверку expert.has_gogs_account -->
                  <button 
                    v-if="expert.has_gogs_account"
                    @click="recreateExpertAccount(expert)"
                    class="action-btn small-btn"
                    title="Пересоздать учетную запись"
                  >
                    🔄
                  </button>
                  <span v-else title="Учетной записи нет">
                    —
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty">
          <p>👨‍🏫 Эксперты не найдены</p>
          <button @click="loadModuleExperts" class="refresh-btn">
            🔄 Обновить
          </button>
        </div>
      </div>
      
      <!-- Публичный репозиторий -->
      <div class="public-repo-section">
        <h4>🌐 Публичный репозиторий</h4>
        
        <div v-if="publicRepoLoading" class="loading">
          <div class="spinner"></div>
          <p>Проверка публичного репозитория...</p>
        </div>
        
        <div v-else-if="publicRepoError" class="error">
          <p>❌ {{ publicRepoError }}</p>
          <button @click="loadPublicRepository" class="retry-btn">
            Повторить
          </button>
        </div>
        
        <!-- Отображаем только если репозиторий НЕ null -->
        <div v-else-if="publicRepository" class="public-repo-info">
          <div class="repo-card">
            <div class="repo-header">
              <h5>{{ publicRepository.name }}</h5>
              <span class="public-badge">🌐 Публичный</span>
            </div>
            
            <div class="repo-description">
              {{ publicRepository.description }}
            </div>
            
            <div v-if="publicRepository.owner" class="repo-owner">
              <small>Владелец: {{ publicRepository.owner.name }} ({{ publicRepository.owner.role }})</small>
            </div>
            
            <div class="repo-links">
              <a 
                :href="publicRepository.url" 
                target="_blank" 
                class="link-btn"
              >
                🌐 Открыть в Gogs
              </a>
              <button 
                @click="copyToClipboard(publicRepository.clone_url)"
                class="link-btn"
              >
                📋 Копировать ссылку
              </button>
            </div>
            
            <div class="repo-meta">
              <small>Доступен: Всем участникам и экспертам</small>
              <small>Права: Только эксперты могут вносить изменения</small>
            </div>
          </div>
        </div>
        
        <!-- Отображаем если репозиторий null (не создан) -->
        <div v-else class="empty">
          <div class="empty-icon">📁</div>
          <p>Публичный репозиторий еще не создан</p>
          <p class="empty-hint">Создайте публичный репозиторий для общих материалов модуля</p>
          <button 
            @click="createPublicRepository" 
            class="primary-btn"
            :disabled="!gogsConnected"
          >
            🚀 Создать публичный репозиторий
          </button>
        </div>
      </div>
    </div>

        <!-- Вкладка "Настройки" -->
        <div v-else-if="activeTab === 'settings'" class="settings-tab">
          <div class="settings-section">
            <h3>Основные настройки модуля</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>Название модуля</label>
                <div class="readonly-field">{{ module?.name || '—' }}</div>
              </div>
              <div class="form-group">
                <label>Статус</label>
                <div class="readonly-field">
                  <span class="status-badge small" :class="getStatusClass(module?.status_id)">
                    {{ module?.status?.name || '—' }}
                  </span>
                </div>
              </div>
              
            </div>
            <button @click="editModule" class="edit-settings-btn">
              Редактировать настройки
            </button>
          </div>

          <div class="settings-section">
            <div class="danger-zone">
              <div class="danger-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <h4>Удаление модуля</h4>
                  <p>Это действие необратимо. Все связанные с модулем данные (базы данных, репозитории, серверы) будут удалены.</p>
                </div>
              </div>
              <button @click="deleteModule" class="danger-btn">
                Удалить модуль
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal">
          <header class="modal-header">
            <h2>Редактировать модуль</h2>
            <button class="modal-close" @click="closeEditModal">×</button>
          </header>
          
          <form @submit.prevent="updateModule" class="modal-form">
            <div class="form-group">
              <label for="edit-module-name">Название модуля *</label>
              <input
                id="edit-module-name"
                v-model="editModuleData.name"
                type="text"
                placeholder="Введите название модуля"
                required
                :disabled="updating"
              />
              <div class="form-hint">Максимум 100 символов</div>
            </div>
            
                       
            <div class="form-group">
              <label for="edit-module-status">Статус *</label>
              <select
                id="edit-module-status"
                v-model="editModuleData.status_id"
                required
                :disabled="updating"
              >
                <option value="">Выберите статус</option>
                <option v-for="status in moduleStatuses" :key="status.id" :value="status.id">
                  {{ status.name }}
                </option>
              </select>
              <div class="form-hint">Определяет доступность модуля</div>
            </div>
            
            <div class="form-group" v-if="editError">
              <div class="error-message">
                <strong>Ошибка:</strong> {{ editError }}
              </div>
            </div>
            
            <footer class="modal-footer">
              <button 
                type="button" 
                class="cancel-btn" 
                @click="closeEditModal"
                :disabled="updating"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="updating || !isEditFormValid"
              >
                <span v-if="updating">Сохранение...</span>
                <span v-else>Сохранить изменения</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventsService } from '@/services/eventsService'
import { RepositoryService } from '@/services/gogsService'
import DatabaseService from '@/services/databaseService'
import { ExpertService } from '@/services/expertService'

const route = useRoute()
const router = useRouter()
const moduleId = route.params.id

const selectedParticipantId = ref('')
const availableParticipants = ref([])
const loadingParticipants = ref(false)
const creatingSingleDatabase = ref(false)
const singleDatabaseError = ref('')
const recreatingDatabase = ref(false)
const recreatingAllDatabases = ref(false)
const droppingAllDatabases = ref(false)
const selectedParticipantForRepo = ref('')
const availableParticipantsForRepo = ref([])
const creatingSingleRepo = ref(false)
const deletingAllRepositories = ref(false)
const recreatingSingleRepo = ref(null)
const expertsLoading = ref(false)
const experts = ref([])
const expertsError = ref('')
const creatingExpertAccounts = ref(false)
const creatingPublicRepo = ref(false)
const publicRepository = ref(null)
const publicRepoLoading = ref(false)
const publicRepoError = ref('')

// Данные модуля
const module = ref(null)
const loading = ref(true)
const error = ref('')

// Вкладки
const activeTab = ref('overview')
const gogsConnected = ref(false)
const gogsInfo = ref(null)
const testingConnection = ref(false)
const repositories = ref([])
const loadingRepositories = ref(false)
const repositoriesError = ref('')
const creatingRepositories = ref(false)

// Модальное окно редактирования
const showEditModal = ref(false)
const updating = ref(false)
const editError = ref('')
const moduleStatuses = ref([])
const editModuleData = ref({
  name: '',
  status_id: ''
})

//БД
const databases = ref([])
const loadingDatabases = ref(false)
const databasesError = ref('')
const creatingDatabases = ref(false) // ← ДОБАВЬТЕ ЭТО
const visiblePasswords = ref({})
const lockingDatabase = ref(false)

const smartActionInProgress = ref(false)

// Переменные состояния
const bulkActionInProgress = ref(false)
const bulkActionType = ref('') // 'lock' или 'unlock'
const togglingRepository = ref(null)

// Вычисляемые свойства

const lockedRepositoriesCount = computed(() => {
  return repositories.value.filter(r => !r.is_active).length
})

const hasActiveRepositories = computed(() => {
  return repositories.value.some(r => r.is_active)
})

const hasLockedRepositories = computed(() => {
  return repositories.value.some(r => !r.is_active)
})

const isEditFormValid = computed(() => {
  return editModuleData.value.name.trim() !== '' &&
         editModuleData.value.status_id !== ''
})

const handleTabChange = async (tabName) => {
  activeTab.value = tabName
  
  if (tabName === 'databases') {
    // Загружаем БД и участников параллельно
    await Promise.all([
      loadDatabases(),
      loadParticipantsForModule()
    ])
  }
  
  if (tabName === 'repositories') {
    loadRepositories()
  }

  if (tabName === 'experts') {
    await Promise.all([
      loadModuleExperts(),
      loadPublicRepository()
    ])
  }
}

const loadParticipantsForModule = async () => {
  try {
    loadingParticipants.value = true
    
    // Проверяем, есть ли у модуля event_id
    if (!module.value?.event_id) {
      console.warn('У модуля нет event_id')
      availableParticipants.value = []
      return
    }
    
    // Используем существующий метод getEventAccounts
    console.log('🔄 Загружаем участников для мероприятия:', module.value.event_id)
    
    // Получаем учетные записи мероприятия
    const accounts = await EventsService.getEventAccounts(module.value.event_id, {
      roles: 'Участник' // Фильтруем только участников
    })
    
    console.log('📋 Получены учетные записи:', accounts)
    
    // Преобразуем в формат для селекта
    availableParticipants.value = accounts
      .filter(account => account.user)
      .map(account => {
        const user = account.user
        // Формируем ФИО
        let fullName = ''
        if (user.last_name || user.first_name || user.middle_name) {
          fullName = `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim()
        } else {
          fullName = user.name || user.login || 'Неизвестный'
        }
        
        return {
          id: account.id, // event_account_id
          name: fullName, // ФИО вместо логина
          login: account.login || user.login,
          seat_number: account.seat_number,
          user_id: account.user_id,
          original_account: account
        }
      })
    
    console.log('✅ Участники подготовлены:', availableParticipants.value)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки участников:', error)
    
    // Fallback: демо-данные
    availableParticipants.value = [
      { id: 1, name: 'Козлова А.И.', login: 'kozlova_exam1', seat_number: 1 },
      { id: 2, name: 'Белов С.П.', login: 'belov_exam1', seat_number: 2 },
      { id: 3, name: 'Соколова М.В.', login: 'sokolova_exam1', seat_number: 3 },
      { id: 4, name: 'Никитин Д.А.', login: 'nikitin_exam1', seat_number: 4 }
    ]
    
  } finally {
    loadingParticipants.value = false
  }
}

const createSingleDatabase = async () => {
  if (!selectedParticipantId.value) {
    alert('Выберите участника')
    return
  }
  
  const participant = availableParticipants.value.find(p => p.id == selectedParticipantId.value)
  if (!participant) {
    alert('Участник не найден')
    return
  }
  
  if (!confirm(`Создать БД для участника ${participant.name}?\n\nБудет создана новая PostgreSQL база данных.`)) {
    return
  }
  
  try {
    creatingSingleDatabase.value = true
    singleDatabaseError.value = ''
    
    console.log('🔄 Создаем БД для участника:', participant)
    
    // Вызываем API для создания одной БД
    const result = await DatabaseService.createDatabaseForParticipant(
      moduleId, 
      participant.id
    )
    
    console.log('📦 Полный ответ от сервера:', result)
    
    if (result.success) {
      // Извлекаем данные из правильной структуры
      const dbName = result.data?.database?.name || 
                    result.database?.name || 
                    result.data?.database_name || 
                    result.database_name || 
                    'Неизвестно'
      
      const username = result.data?.database?.username || 
                      result.database?.username || 
                      result.data?.username || 
                      result.username || 
                      participant.login
      
      const password = result.data?.database?.password || 
                      result.database?.password || 
                      result.data?.password || 
                      result.password || 
                      '(скрыто)'
      
      alert(`БД успешно создана для ${participant.name}\n\n` +
            `Название: ${dbName}\n` +
            `Пользователь: ${username}\n` +
            `Пароль: ${password.length > 0 ? '********' : 'не установлен'}\n\n` +
            `Для подключения:\n` +
            `psql -h localhost -p 5432 -U ${username} -d ${dbName}`)
      
      // Обновляем список БД
      await loadDatabases()
      
      // Очищаем выбор
      selectedParticipantId.value = ''
    } else {
      throw new Error(result.message || 'Ошибка создания БД')
    }
    
  } catch (error) {
    console.error('❌ Ошибка создания БД:', error)
    singleDatabaseError.value = error.message || 'Ошибка создания БД'
    alert(`❌ ${singleDatabaseError.value}`)
  } finally {
    creatingSingleDatabase.value = false
  }
}

// Пересоздание БД (для существующей записи)
const recreateDatabase = async (db) => {
  // Используем весь объект db
  if (!db || !db.event_account_id) {
    alert('Нет данных об участнике')
    return
  }
  
  const participantName = db.event_account?.user?.name || db.username || 'участника'
  
  if (!confirm(`Пересоздать БД для участника ${participantName}?\n\nСтарая БД будет удалена и создана новая.`)) {
    return
  }
  
  try {
    recreatingDatabase.value = true
    
    console.log('🔄 Пересоздаем БД:', db)
    
    // Используем event_account_id из объекта БД
    const result = await DatabaseService.createDatabaseForParticipant(
      moduleId, 
      db.event_account_id
    )
    
    console.log('✅ Результат пересоздания:', result)
    
    if (result.success) {
      alert('✅ БД успешно пересоздана')
      
      // Обновляем список БД
      await loadDatabases()
    } else {
      throw new Error(result.message || 'Ошибка пересоздания БД')
    }
    
  } catch (error) {
    console.error('❌ Ошибка пересоздания БД:', error)
    alert(`❌ ${error.message || 'Ошибка пересоздания БД'}`)
  } finally {
    recreatingDatabase.value = false
  }
}

// Заглушка для удаления
const deleteDatabase = (databaseId) => {
  alert('Функция удаления БД в разработке')
}


const loadModule = async () => {
  try {
    loading.value = true
    module.value = await EventsService.getModuleById(moduleId)
    console.log('✅ Модуль загружен:', module.value)
  } catch (err) {
    console.error('❌ Ошибка загрузки модуля:', err)
    error.value = err.message || 'Ошибка загрузки модуля'
  } finally {
    loading.value = false
  }
}

const loadModuleStatuses = async () => {
  try {
    moduleStatuses.value = await EventsService.getModuleStatuses()
  } catch (err) {
    console.error('Ошибка загрузки статусов модулей:', err)
    moduleStatuses.value = [
      { id: 1, name: 'Запланирован' },
      { id: 2, name: 'Активен' },
      { id: 3, name: 'Завершён' },
      { id: 4, name: 'Отменён' }
    ]
  }
}

const loadModuleExperts = async () => {
  try {
    expertsLoading.value = true  // ← используйте правильное имя
    expertsError.value = ''
    
    experts.value = await ExpertService.getModuleExperts(moduleId)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки экспертов:', error)
    expertsError.value = error.message || 'Не удалось загрузить экспертов'
  } finally {
    expertsLoading.value = false  // ← используйте правильное имя
  }
}

const goBack = () => {
  if (module.value?.event_id) {
    router.push(`/events/${module.value.event_id}`)
  } else {
    router.push('/events')
  }
}

// Функция загрузки
const loadDatabases = async () => {
  try {
    loadingDatabases.value = true
    databasesError.value = ''
    
    console.log('🔄 Загружаем БД для модуля', moduleId)
    const data = await DatabaseService.getModuleDatabases(moduleId)
    
    // Проверяем структуру ответа
    console.log('📦 Полученные данные:', data)
    
    // Если ответ - массив
    if (Array.isArray(data)) {
      databases.value = data
    } 
    // Если ответ - объект с данными
    else if (data && data.data) {
      databases.value = data.data
    }
    // Если другой формат
    else {
      databases.value = [data]
    }
    
    console.log(`✅ Загружено ${databases.value.length} БД`)
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error)
    databasesError.value = error.message || 'Ошибка загрузки баз данных'
  } finally {
    loadingDatabases.value = false
  }
}

const testConnectionDirectly = async () => {
  try {
    console.log('🔍 Тестируем прямое подключение...')
    
    // 1. Проверяем токен
    const token = localStorage.getItem('auth_token')
    console.log('Токен в localStorage:', token ? '✅ есть' : '❌ нет')
    
    // 2. Делаем простой GET запрос на рабочий endpoint
    const testUrl = 'http://localhost:8000/api/databases/test-connection'
    
    console.log('🔄 Отправляем запрос на:', testUrl)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    })
    
    console.log('📊 Статус ответа:', response.status)
    console.log('📊 Статус текст:', response.statusText)
    
    const text = await response.text()
    console.log('📦 Текст ответа:', text)
    
    try {
      const data = JSON.parse(text)
      console.log('✅ JSON ответ:', data)
      alert(`✅ Сервер отвечает!\n${JSON.stringify(data, null, 2)}`)
    } catch {
      console.log('❌ Ответ не JSON:', text)
      alert(`❌ Ответ не JSON:\n${text}`)
    }
    
  } catch (error) {
    console.error('🔥 Критическая ошибка:', error)
    alert(`🔥 Ошибка подключения:\n${error.message}\n\nПроверьте:\n1. Сервер Laravel запущен\n2. Адрес правильный\n3. Нет блокировки брандмауэром`)
  }
}

// Умная функция: создает или пересоздает
const smartCreateOrRecreateRepositories = async () => {
  const hasRepositories = repositories.value.length > 0
  
  if (hasRepositories) {
    if (!confirm(`🔄 ПЕРЕСОЗДАТЬ ВСЕ ${repositories.value.length} РЕПОЗИТОРИЕВ?\n\n⚠️ Это удалит все существующие репозитории и создаст новые!\n⚠️ Данные в репозиториях будут потеряны!\n⚠️ Действие необратимо!`)) {
      return
    }
  } else {
    if (!confirm(`🚀 СОЗДАТЬ РЕПОЗИТОРИИ ДЛЯ ВСЕХ УЧАСТНИКОВ?`)) {
      return
    }
  }
  
  try {
    smartActionInProgress.value = true
    
    console.log('🔄 Отправляем запрос на умное действие...', {
      moduleId,
      recreate: hasRepositories,
      currentRepositories: repositories.value.length
    })
    
    const result = await RepositoryService.smartRepositoriesAction(moduleId, hasRepositories)
    
    console.log('📊 Детальный результат:', result)
    
    // Формируем детальное сообщение
    let message = `✅ ${result.message}\n\n`
    message += `📊 Статистика:\n`
    message += `   • Всего участников: ${result.data.total}\n`
    message += `   • ✅ Успешно: ${result.data.successful}\n`
    message += `   • ❌ Ошибок: ${result.data.failed}\n`
    
    if (result.data.deleted_count > 0) {
      message += `   • 🗑️ Удалено старых: ${result.data.deleted_count}\n`
    }
    
    // Показываем детали ошибок (первые 3)
    if (result.data.failed > 0 && result.data.repositories) {
      const errors = result.data.repositories.filter(r => !r.success)
      if (errors.length > 0) {
        message += `\n⚠️ Ошибки (первые 3):\n`
        errors.slice(0, 3).forEach((error, index) => {
          message += `   ${index + 1}. ${error.participant_name}: ${error.error}\n`
        })
        if (errors.length > 3) {
          message += `   ... и еще ${errors.length - 3} ошибок\n`
        }
      }
    }
    
    alert(message)
    
    // Перезагружаем список
    await loadRepositories()
    
  } catch (error) {
    console.error('🔥 Критическая ошибка:', error)
    alert(`❌ Ошибка: ${error.message || 'Не удалось выполнить действие'}\n\nПроверьте консоль для деталей.`)
  } finally {
    smartActionInProgress.value = false
  }
}

// Пересоздать один репозиторий
const recreateSingleRepository = async (repo) => {
  const participantName = repo.participant?.name || 'Участник'
  
  if (!confirm(`🔄 Пересоздать репозиторий для "${participantName}"?\n\n⚠️ Старый репозиторий будет удален!\n⚠️ Данные в репозитории будут потеряны!`)) {
    return
  }
  
  try {
    recreatingSingleRepo.value = repo.id
    
    // Используем тот же метод, что и для выпадающего списка
    const result = await RepositoryService.createOrRecreateSingleRepository(
      moduleId, 
      repo.participant?.id || repo.event_account_id,
      true // recreate = true
    )
    
    alert(`✅ Репозиторий успешно пересоздан!\n\nНазвание: ${result.data.repository_name}\nURL: ${result.data.repository_url}`)
    
    // Обновляем список репозиториев
    await loadRepositories()
    
  } catch (error) {
    console.error('❌ Ошибка пересоздания репозитория:', error)
    alert(`❌ ${error.message || 'Не удалось пересоздать репозиторий'}`)
  } finally {
    recreatingSingleRepo.value = null
  }
}

const activeDatabasesCount = computed(() => {
  return databases.value.filter(db => db.is_active).length
})

const emptyDatabasesCount = computed(() => {
  return databases.value.filter(db => db.is_empty).length
})

// Вычисляемые свойства
const activeRepositoriesCount = computed(() => {
  return repositories.value.filter(r => r.is_active).length
})

const privateRepositoriesCount = computed(() => {
  return repositories.value.filter(r => r.is_private).length
})

const gogsStatusClass = computed(() => {
  return gogsConnected.value ? 'connected' : 'disconnected'
})

// Методы
const testGogsConnection = async () => {
  try {
    testingConnection.value = true
    const result = await RepositoryService.testGogsConnection()
    gogsConnected.value = result.status === 'connected'
    gogsInfo.value = result
    alert(`✅ ${result.message}`)
  } catch (error) {
    gogsConnected.value = false
    alert('❌ Не удалось подключиться к Gogs')
  } finally {
    testingConnection.value = false
  }
}

const loadRepositories = async () => {
  try {
    loadingRepositories.value = true
    repositoriesError.value = ''
    repositories.value = await RepositoryService.getModuleRepositories(moduleId)
  } catch (error) {
    repositoriesError.value = error.message || 'Ошибка загрузки репозиториев'
  } finally {
    loadingRepositories.value = false
  }
}

const createAllRepositories = async () => {
  if (!confirm('Создать Git-репозитории для всех участников мероприятия?\n\nНа предзащите: создаются демо-записи\nВ реальной системе: создаются настоящие Git-репозитории')) {
    return
  }
  
  try {
    creatingRepositories.value = true
    const result = await RepositoryService.createRepositoriesForModule(moduleId)
    
    alert(`✅ ${result.message}\n\nУспешно: ${result.data.successful}\nОшибок: ${result.data.failed}`)
    
    // Перезагружаем список
    await loadRepositories()
    
  } catch (error) {
    alert(`❌ Ошибка: ${error.message || 'Не удалось создать репозитории'}`)
  } finally {
    creatingRepositories.value = false
  }
}

/**
 * Подтверждение удаления всех БД
 */
const confirmDropAllDatabases = () => {
  if (databases.value.length === 0) {
    alert('Нет баз данных для удаления')
    return
  }
  
  const confirmationMessage = `
⚠️ ⚠️ ⚠️  ОПАСНОЕ ДЕЙСТВИЕ  ⚠️ ⚠️ ⚠️

Вы собираетесь удалить ВСЕ базы данных модуля:
• Всего БД: ${databases.value.length}
• Участников с БД: ${new Set(databases.value.map(db => db.event_account_id)).size}

❗ ЭТО ДЕЙСТВИЕ НЕОБРАТИМО
❗ Все данные в базах будут БЕЗВОЗВРАТНО УДАЛЕНЫ
❗ Участники потеряют доступ к своим данным

Для подтверждения введите: "УДАЛИТЬ ${databases.value.length} БД"
  `.trim()
  
  const userInput = prompt(confirmationMessage)
  
  if (userInput === `УДАЛИТЬ ${databases.value.length} БД`) {
    dropAllDatabases()
  } else if (userInput !== null) {
    alert('❌ Неправильный код подтверждения. Удаление отменено.')
  }
}

/**
 * Удалить ВСЕ базы данных модуля
 */
const dropAllDatabases = async () => {
  try {
    droppingAllDatabases.value = true
    
    const result = await DatabaseService.dropAllDatabases(moduleId)
    
    if (result.success) {
      let message = `✅ ${result.message}\n\n`
      
      if (result.details) {
        message += `📊 Статистика:\n`
        message += `   • Всего найдено: ${result.details.total_found}\n`
        message += `   • ✅ Успешно удалено: ${result.details.successfully_deleted}\n`
        message += `   • ❌ Ошибок: ${result.details.failed}\n`
      }
      
      if (result.errors && result.errors.length > 0) {
        message += `\n⚠️ Ошибки удаления:\n`
        result.errors.slice(0, 3).forEach((error, index) => {
          message += `   ${index + 1}. ${error.database_name}: ${error.error}\n`
        })
        if (result.errors.length > 3) {
          message += `   ... и еще ${result.errors.length - 3} ошибок\n`
        }
      }
      
      alert(message)
      
      // Очищаем локальный список
      databases.value = []
      
    } else {
      throw new Error(result.message || 'Ошибка удаления БД')
    }
    
  } catch (error) {
    console.error('❌ Ошибка массового удаления БД:', error)
    
    let errorMessage = error.message || 'Неизвестная ошибка'
    
    // Показываем детальную ошибку
    if (error.response?.data?.errors) {
      errorMessage += '\n\nДетали ошибок:\n'
      error.response.data.errors.slice(0, 3).forEach((err, i) => {
        errorMessage += `${i + 1}. ${err.database_name}: ${err.error}\n`
      })
    }
    
    alert(`❌ ${errorMessage}`)
    
  } finally {
    droppingAllDatabases.value = false
  }
}

/**
 * Безопасное удаление (только записи, не БД PostgreSQL)
 */
const safeDeleteAllDatabases = async () => {
  if (!confirm(`Безопасно удалить все записи о БД?\n\nБудут удалены только записи из системы, но БД в PostgreSQL останутся.`)) {
    return
  }
  
  try {
    droppingAllDatabases.value = true
    
    // Удаляем записи из БД приложения
    const response = await apiClient.delete(
      `/modules/${moduleId}/databases/delete-records`,
      { timeout: 30000 }
    )
    
    if (response.data.success) {
      alert(`✅ Удалено записей: ${response.data.deleted_count}\n\nТеперь вы можете:\n1. Создать новые БД через "Синхронизировать БД"\n2. Вручную удалить реальные БД PostgreSQL`)
      
      // Очищаем список
      databases.value = []
    }
    
  } catch (error) {
    console.error('❌ Ошибка безопасного удаления:', error)
    alert(`❌ ${error.message || 'Ошибка удаления записей'}`)
  } finally {
    droppingAllDatabases.value = false
  }
}

const copyPassword = (password) => {
  if (!password) {
    alert('Пароль недоступен')
    return
  }
  
  navigator.clipboard.writeText(password)
    .then(() => {
      // Показать уведомление
      alert('✅ Пароль скопирован в буфер обмена')
    })
    .catch(err => {
      console.error('Ошибка копирования:', err)
      alert('❌ Не удалось скопировать пароль')
    })
}

const deleteRepository = async (repo) => {
  const participantName = repo.participant?.name || 'Участник'
  
  if (!confirm(`🗑️ Удалить репозиторий "${repo.name}" для участника ${participantName}?\n\n⚠️ Репозиторий будет удален из Gogs!\n⚠️ Пользователь будет удален из Gogs!\n⚠️ Действие необратимо!`)) {
    return
  }
  
  try {
    const result = await RepositoryService.deleteSingleRepository(
      moduleId,
      repo.id,
      repo.participant?.id || repo.event_account_id
    )
    
    alert(`✅ ${result.message || 'Репозиторий удален'}`)
    
    // Удаляем из локального списка
    repositories.value = repositories.value.filter(r => r.id !== repo.id)
    
  } catch (error) {
    alert(`❌ ${error.message}`)
  }
}

const openRepository = (repo) => {
  window.open(repo.url, '_blank')
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('✅ Ссылка скопирована в буфер обмена'))
    .catch(() => alert('❌ Не удалось скопировать'))
}

const getStatusText = (status) => {
  const statusMap = {
    'active': '✅ Активен',
    'locked': '🔒 Заблокирован',
    'disabled': '❌ Отключен', 
    'pending': '⏳ Ожидает',
    'error': '⚠️ Ошибка'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// При загрузке страницы
onMounted(async () => {
  // Автоматически проверяем подключение
  await testGogsConnection()
  // Загружаем репозитории
  await loadRepositories()
})

// Методы для кнопок добавления (заглушки)
const addDatabase = () => {
  alert('Функция добавления базы данных в разработке')
}

const addRepository = () => {
  alert('Функция добавления репозитория в разработке')
}

const addServer = () => {
  alert('Функция добавления сервера в разработке')
}

const openEditModal = () => {
  if (!module.value) return
  
  editModuleData.value = {
    name: module.value.name || '',
    status_id: module.value.status_id?.toString() || ''
  }
  
  showEditModal.value = true
}

/**
 * Переключение видимости пароля
 */
const togglePasswordVisibility = (databaseId) => {
  if (visiblePasswords.value[databaseId]) {
    // Если пароль уже показан - скрываем
    visiblePasswords.value[databaseId] = false
  } else {
    // Показываем пароль
    visiblePasswords.value[databaseId] = true

    
    // Автоматически скрываем через 30 секунд
    setTimeout(() => {
      if (visiblePasswords.value[databaseId]) {
        visiblePasswords.value[databaseId] = false
      }
    }, 30000)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editModuleData.value = {
    name: '',
    description: '',
    status_id: ''
  }
  editError.value = ''
  updating.value = false
}

const updateModule = async () => {
  if (!isEditFormValid.value) return
  
  try {
    updating.value = true
    editError.value = ''
    
    const updateData = {
      name: editModuleData.value.name.trim(),
      status_id: parseInt(editModuleData.value.status_id)
    }
    
    console.log('🔄 Обновляем модуль:', updateData)
    
    const updatedModule = await EventsService.updateModule(moduleId, updateData)
    console.log('✅ Модуль обновлен:', updatedModule)
    
    // Обновляем данные
    module.value = updatedModule
    
    closeEditModal()
    alert('✅ Изменения сохранены!')
    
  } catch (err) {
    console.error('❌ Ошибка обновления модуля:', err)
    
    if (err.response?.status === 422) {
      editError.value = 'Проверьте правильность заполнения полей'
    } else {
      editError.value = err.message || 'Не удалось обновить модуль'
    }
  } finally {
    updating.value = false
  }
}

const editModule = () => {
  if (!module.value) {
    alert('Данные модуля еще не загружены')
    return
  }
  openEditModal()
}

const deleteModule = async () => {
  if (!module.value) return
  
  const moduleName = module.value.name || 'этот модуль'
  
  if (!confirm(`Вы уверены, что хотите удалить модуль "${moduleName}"?\n\nЭто действие нельзя отменить.`)) {
    return
  }
  
  try {
    console.log(`🗑️ Удаляем модуль ${moduleId}...`)
    await EventsService.deleteModule(moduleId)
    
    alert(`✅ Модуль "${moduleName}" успешно удален`)
    
    // Возвращаемся к мероприятию
    if (module.value?.event_id) {
      router.push(`/events/${module.value.event_id}`)
    } else {
      router.push('/events')
    }
    
  } catch (err) {
    console.error('❌ Ошибка удаления модуля:', err)
    
    let message = 'Не удалось удалить модуль'
    if (err.message.includes('не найден')) {
      message = 'Модуль не найден'
    } else if (err.message.includes('прав')) {
      message = 'У вас нет прав на удаление'
    } else if (err.message.includes('активные данные')) {
      message = 'Нельзя удалить модуль с активными данными'
    }
    
    alert(`❌ ${message}\n\n${err.message}`)
  }
}

/**
 * Пересоздать БД для конкретного участника (кнопка 🔄 в таблице)
 */
const syncSingleDatabase = async (participant) => {
  const participantName = participant.name || participant.participant_name || participant.username
  
  if (!confirm(`Синхронизировать БД для участника "${participantName}"?\n\nЕсли БД уже существует, она будет пересоздана.`)) {
    return
  }
  
  try {
    recreatingDatabase.value = true
    
    console.log('🔄 Синхронизация БД для участника:', participant)
    
    const result = await DatabaseService.recreateDatabaseForParticipant(
      moduleId, 
      participant.id || participant.event_account_id
    )
    
    console.log('✅ Результат:', result)
    
    alert(`✅ БД для "${participantName}" синхронизирована!\n\nНазвание БД: ${result.database.name}\nПользователь: ${result.database.username}`)
    
    // Обновляем список БД
    await loadDatabases()
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации БД для участника:', error)
    alert(`❌ ${error.message || 'Ошибка синхронизации БД'}`)
  } finally {
    recreatingDatabase.value = false
  }
}

/**
 * Универсальная синхронизация БД
 * - Создает БД для новых участников
 * - Пересоздает БД для существующих участников
 */
const syncDatabases = async () => {
  const confirmationMessage = `
🚀 СИНХРОНИЗАЦИЯ БАЗ ДАННЫХ

Что будет сделано:
✅ Для участников БЕЗ БД: будут созданы новые БД
✅ Для участников С БД: БД будут пересозданы (данные удалятся!)
📊 Все участники модуля будут обработаны

Продолжить?
`
  
  if (!confirm(confirmationMessage)) {
    return
  }
  
  try {
    creatingDatabases.value = true
    databasesError.value = ''
    
    alert('🔄 Запущена синхронизация БД. Пожалуйста, подождите...')
    
    // Используем универсальный метод
    const result = await DatabaseService.syncDatabasesForModule(moduleId)
    
    console.log('✅ Результат синхронизации:', result)
    
    if (result.success) {
      // Формируем детальный отчет
      let report = `🎉 ${result.message}\n\n`
      report += `📊 Статистика:\n`
      report += `   • Участников всего: ${result.details.total_participants}\n`
      report += `   • 📝 Создано новых БД: ${result.details.created}\n`
      report += `   • 🔄 Обновлено БД: ${result.details.updated}\n`
      report += `   • ❌ Ошибок: ${result.details.failed}\n\n`
      
      // Добавляем информацию о подключении
      if (result.results && result.results.length > 0) {
        const firstSuccess = result.results.find(r => r.success && r.action === 'created')
        if (firstSuccess) {
          report += `🔗 Пример подключения к новой БД:\n`
          report += `   psql -h ${window.location.hostname} -p 5432 -U ${firstSuccess.username} -d ${firstSuccess.database_name}\n`
        }
      }
      
      alert(report)
    } else {
      throw new Error(result.message || 'Ошибка синхронизации')
    }
    
    // Обновляем список БД
    await loadDatabases()
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации БД:', error)
    
    let errorMessage = error.message || 'Неизвестная ошибка'
    databasesError.value = errorMessage
    
    alert(`❌ ${errorMessage}\n\nПроверьте логи сервера для деталей.`)
    
  } finally {
    creatingDatabases.value = false
  }
}

/**
 * Удалить БД (только удаление)
 */
const dropDatabase = async (databaseId, databaseName) => {
  if (!confirm(`Удалить базу данных "${databaseName}"?\n\nЭто действие нельзя отменить.`)) {
    return
  }
  
  try {
    const result = await DatabaseService.dropDatabase(databaseId)
    
    alert(result.message || 'База данных удалена')
    
    // Удаляем из локального списка
    databases.value = databases.value.filter(db => db.id !== databaseId)
    
  } catch (error) {
    console.error('❌ Ошибка удаления БД:', error)
    alert(`❌ ${error.message || 'Ошибка удаления БД'}`)
  }
}

const getStatusClass = (statusId) => {
  const classes = {
    1: 'status-planned',
    2: 'status-active', 
    3: 'status-completed',
    4: 'status-cancelled'
  }
  return classes[statusId] || 'status-unknown'
}

const hasActiveDatabases = computed(() => {
  return databases.value.some(db => db.is_active)
})

const hasLockedDatabases = computed(() => {
  return databases.value.some(db => !db.is_active)
})

/**
 * Блокировка всех БД
 */
const lockAllDatabases = async () => {
  const activeCount = databases.value.filter(db => db.is_active).length
  
  if (activeCount === 0) {
    alert('Нет активных БД для блокировки')
    return
  }
  
  const reason = prompt(`Блокировка всех ${activeCount} БД.\nУкажите причину:`, 'Экзамен завершен') || ''
  
  if (!confirm(`ЗАБЛОКИРОВАТЬ ВСЕ ${activeCount} БД?\n\n⚠️  ВНИМАНИЕ ⚠️\n• БД перейдут в режим "ТОЛЬКО ЧТЕНИЕ"\n• Пользователи НЕ СМОГУТ создавать объекты\n• Пароли будут изменены\n• Для разблокировки нужна будет административная операция`)) {
    return
  }
  
  try {
    lockingDatabase.value = true
    
    const promises = databases.value
      .filter(db => db.is_active)
      .map(db => DatabaseService.toggleDatabaseLock(db.id, 'lock', reason))
    
    const results = await Promise.allSettled(promises)
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.filter(r => r.status === 'rejected').length
    
    let message = `📊 РЕЗУЛЬТАТЫ БЛОКИРОВКИ:\n\n`
    message += `✅ Успешно заблокировано: ${successful} БД\n`
    message += `❌ Ошибок: ${failed}\n\n`
    
    if (successful > 0) {
      message += `🔒 Заблокированные БД:\n`
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const db = databases.value.filter(db => db.is_active)[index]
          message += `• ${db.name} (${db.username})\n`
        }
      })
    }
    
    alert(message)
    
    // Обновляем список БД
    await loadDatabases()
    
  } catch (error) {
    console.error('❌ Ошибка массовой блокировки:', error)
    alert(`❌ ${error.message || 'Ошибка массовой блокировки'}`)
  } finally {
    lockingDatabase.value = false
  }
}

const lockAllRepositories = async () => {
  const activeCount = activeRepositoriesCount.value
  
  if (activeCount === 0) {
    alert('Нет активных репозиториев для блокировки')
    return
  }
  
  if (!confirm(`🔒 ЗАБЛОКИРОВАТЬ ВСЕ ${activeCount} РЕПОЗИТОРИЕВ?\n\n⚠️ Участники смогут только:\n• Просматривать код\n• Клонировать репозиторий\n\n❌ Не смогут:\n• Делать коммиты\n• Создавать ветки\n• Отправлять изменения\n\nДействие обратимо.`)) {
    return
  }
  
  try {
    bulkActionInProgress.value = true
    bulkActionType.value = 'lock'
    
    const result = await RepositoryService.bulkToggleRepositories(moduleId, false)
    
    let message = `✅ ${result.message}\n\n`
    message += `📊 Статистика:\n`
    message += `   • Всего репозиториев: ${result.data.total}\n`
    message += `   • ✅ Заблокировано: ${result.data.updated}\n`
    message += `   • ❌ Ошибок: ${result.data.failed}\n\n`
    
    if (result.data.failed > 0) {
      message += `⚠️ Ошибки (первые 3):\n`
      result.data.details
        .filter(d => !d.success)
        .slice(0, 3)
        .forEach((error, i) => {
          message += `   ${i + 1}. ${error.repository_name}: ${error.error}\n`
        })
    }
    
    alert(message)
    
    // Обновляем список
    await loadRepositories()
    
  } catch (error) {
    console.error('❌ Ошибка массовой блокировки:', error)
    alert(`❌ ${error.message || 'Не удалось заблокировать репозитории'}`)
  } finally {
    bulkActionInProgress.value = false
    bulkActionType.value = ''
  }
}

const unlockAllRepositories = async () => {
  const lockedCount = lockedRepositoriesCount.value
  
  if (lockedCount === 0) {
    alert('Нет заблокированных репозиториев')
    return
  }
  
  if (!confirm(`🔓 РАЗБЛОКИРОВАТЬ ВСЕ ${lockedCount} РЕПОЗИТОРИЕВ?\n\n✅ Участники смогут:\n• Делать коммиты\n• Создавать ветки\n• Отправлять изменения\n\nДействие обратимо.`)) {
    return
  }
  
  try {
    bulkActionInProgress.value = true
    bulkActionType.value = 'unlock'
    
    const result = await RepositoryService.bulkToggleRepositories(moduleId, true)
    
    let message = `✅ ${result.message}\n\n`
    message += `📊 Статистика:\n`
    message += `   • Всего репозиториев: ${result.data.total}\n`
    message += `   • ✅ Разблокировано: ${result.data.updated}\n`
    message += `   • ❌ Ошибок: ${result.data.failed}\n`
    
    alert(message)
    
    // Обновляем список
    await loadRepositories()
    
  } catch (error) {
    console.error('❌ Ошибка массовой разблокировки:', error)
    alert(`❌ ${error.message || 'Не удалось разблокировать репозитории'}`)
  } finally {
    bulkActionInProgress.value = false
    bulkActionType.value = ''
  }
}

// Обновленный метод для переключения одного репозитория
const toggleRepositoryAccess = async (repo) => {
  const action = repo.is_active ? 'заблокировать' : 'разблокировать'
  const participantName = repo.participant?.name || 'Участник'
  
  const message = repo.is_active 
    ? `🔒 Заблокировать репозиторий для "${participantName}"?\n\n⚠️ Участник сможет только:\n• Просматривать код\n• Клонировать репозиторий\n\n❌ Не сможет:\n• Делать коммиты\n• Создавать ветки\n• Отправлять изменения`
    : `🔓 Разблокировать репозиторий для "${participantName}"?\n\n✅ Участник сможет:\n• Делать коммиты\n• Создавать ветки\n• Отправлять изменения`
  
  if (!confirm(message)) {
    return
  }
  
  try {
    togglingRepository.value = repo.id
    
    const result = await RepositoryService.toggleRepository(
      repo.id, 
      !repo.is_active
    )
    
    console.log('✅ Результат переключения:', result)
    
    if (result.success) {
      // Обновляем локальные данные
      repo.is_active = !repo.is_active
      repo.status = repo.is_active ? 'active' : 'locked'
      
      const statusText = repo.is_active ? 'разблокирован' : 'заблокирован'
      alert(`✅ Репозиторий ${statusText}`)
    } else {
      throw new Error(result.message || 'Ошибка переключения')
    }
    
  } catch (error) {
    console.error('❌ Ошибка переключения статуса:', error)
    alert(`❌ ${error.message || 'Не удалось изменить статус'}`)
  } finally {
    togglingRepository.value = null
  }
}

/**
 * Разблокировка всех БД
 */
const unlockAllDatabases = async () => {
  const lockedCount = databases.value.filter(db => !db.is_active).length
  
  if (lockedCount === 0) {
    alert('Нет заблокированных БД')
    return
  }
  
  if (!confirm(`Разблокировать все ${lockedCount} БД?\n\nПользователи получат полный доступ.`)) {
    return
  }
  
  try {
    lockingDatabase.value = true
    
    const promises = databases.value
      .filter(db => !db.is_active)
      .map(db => DatabaseService.toggleDatabaseLock(db.id, 'unlock'))
    
    const results = await Promise.allSettled(promises)
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.filter(r => r.status === 'rejected').length
    
    alert(`✅ Разблокировано: ${successful} БД\n❌ Ошибок: ${failed}`)
    
    // Обновляем список
    await loadDatabases()
    
  } catch (error) {
    console.error('❌ Ошибка массовой разблокировки:', error)
    alert(`❌ ${error.message || 'Ошибка массовой разблокировки'}`)
  } finally {
    lockingDatabase.value = false
  }
}

/**
 * Блокировка/разблокировка БД (только чтение)
 */
const toggleDatabaseLock = async (database) => {
  const action = database.is_active ? 'lock' : 'unlock'
  const actionText = database.is_active ? 'заблокировать' : 'разблокировать'
  const participantName = database.event_account?.user?.name || database.username
  
  const message = database.is_active 
    ? `Заблокировать БД для участника ${participantName}?\n\nПользователь сможет войти, но не сможет:\n• Создавать таблицы\n• Изменять данные\n• Удалять данные\n• Создавать функции`
    : `Разблокировать БД для участника ${participantName}?\n\nПользователь получит полный доступ.`
  
  if (!confirm(message)) {
    return
  }
  
  try {
    lockingDatabase.value = true
    
    // Запрашиваем причину для блокировки
    let reason = ''
    if (action === 'lock') {
      reason = prompt('Укажите причину блокировки (необязательно):', 'Административная блокировка') || ''
    }
    
    const result = await DatabaseService.toggleDatabaseLock(database.id, action, reason)
    
    if (result.success) {
      alert(`✅ ${result.message}`)
      
      // Обновляем данные БД
      const updatedDb = await DatabaseService.getDatabase(database.id)
      Object.assign(database, updatedDb) // обновляем текущий объект
    }
    
  } catch (error) {
    console.error(`❌ Ошибка ${action === 'lock' ? 'блокировки' : 'разблокировки'} БД:`, error)
    alert(`❌ ${error.message || `Ошибка ${actionText} БД`}`)
  } finally {
    lockingDatabase.value = false
  }
}

// Загружаем участников для создания одного репозитория
const loadParticipantsForSingleRepo = async () => {
  try {
    if (!module.value?.event_id) return
    
    // Получаем учетные записи мероприятия
    const accounts = await EventsService.getEventAccounts(module.value.event_id, {
      roles: 'Участник'
    })
    
    // Получаем текущие репозитории
    const currentRepos = repositories.value
    
    // Формируем список участников
    availableParticipantsForRepo.value = accounts
      .filter(account => account.user)
      .map(account => {
        const user = account.user
        let fullName = ''
        if (user.last_name || user.first_name || user.middle_name) {
          fullName = `${user.last_name || ''} ${user.first_name || ''} ${user.middle_name || ''}`.trim()
        } else {
          fullName = user.name || user.login || 'Неизвестный'
        }
        
        // Проверяем, есть ли уже репозиторий у этого участника
        const hasRepo = currentRepos.some(repo => 
          repo.event_account_id === account.id || 
          repo.participant?.id === account.user_id
        )
        
        return {
          id: account.id,
          name: fullName,
          login: account.login,
          seat_number: account.seat_number,
          user_id: account.user_id,
          hasRepo: hasRepo
        }
      })
    
  } catch (error) {
    console.error('Ошибка загрузки участников:', error)
  }
}

const recreateExpertAccount = async (expert) => {
  if (!expert || !expert.id) {
    alert('Данные эксперта не найдены')
    return
  }

  if (!confirm(`🔄 Пересоздать учетную запись для эксперта "${expert.name}"?\n\nСтарая учетная запись будет удалена из Gogs!\nБудет создана новая с новым паролем.`)) {
    return
  }
  
  try {
    const result = await ExpertService.recreateExpertAccount(moduleId, expert.id)
    
    alert(`✅ Учетная запись успешно пересоздана!\n\nЛогин: ${result.data.username}\nПароль: ${result.data.password}`)
    
    // Обновляем список экспертов
    await loadModuleExperts()
    
  } catch (error) {
    console.error('❌ Ошибка пересоздания учетной записи:', error)
    alert(`❌ ${error.message || 'Не удалось пересоздать учетную запись'}`)
  }
}

const openExpertGogs = (expert) => {
  if (expert.has_gogs_account) {
    window.open(`https://213441fe8ea4.vps.myjino.ru`, '_blank');
  }
}

// Проверка статуса репозитория участника
const getParticipantRepoStatus = (participantId) => {
  const participant = availableParticipantsForRepo.value.find(p => p.id == participantId)
  return participant?.hasRepo ? 'has_repo' : 'no_repo'
}

// Создание/пересоздание одного репозитория
const createOrRecreateSingleRepository = async () => {
  if (!selectedParticipantForRepo.value) return
  
  const participant = availableParticipantsForRepo.value.find(p => p.id == selectedParticipantForRepo.value)
  if (!participant) return
  
  const hasRepo = participant.hasRepo
  const action = hasRepo ? 'пересоздать' : 'создать'
  const actionWarning = hasRepo 
    ? '⚠️ Старый репозиторий будет удален!\n⚠️ Данные будут потеряны!'
    : 'Будет создан новый приватный Git-репозиторий.'
  
  if (!confirm(`${hasRepo ? '🔄' : '🚀'} ${action.toUpperCase()} репозиторий для участника "${participant.name}"?\n\n${actionWarning}`)) {
    return
  }
  
  try {
    creatingSingleRepo.value = true
    
    const result = await RepositoryService.createOrRecreateSingleRepository(
      moduleId, 
      participant.id,
      hasRepo
    )
    
    const successMessage = hasRepo 
      ? `Репозиторий успешно пересоздан!\n\nНазвание: ${result.data.repository_name}\nURL: ${result.data.repository_url}`
      : `Репозиторий успешно создан!\n\nНазвание: ${result.data.repository_name}\nURL: ${result.data.repository_url}`
    
    alert(successMessage)
    
    // Обновляем списки
    await loadRepositories()
    await loadParticipantsForSingleRepo()
    
    // Сбрасываем выбор
    selectedParticipantForRepo.value = ''
    
  } catch (error) {
    console.error('❌ Ошибка создания/пересоздания репозитория:', error)
    alert(`❌ ${error.message || 'Не удалось выполнить действие'}`)
  } finally {
    creatingSingleRepo.value = false
  }
}

// Метод удаления ВСЕХ репозиториев
const deleteAllRepositories = async () => {
  if (repositories.value.length === 0) {
    alert('Нет репозиториев для удаления')
    return
  }
  
  const confirmationMessage = `
⚠️ ⚠️ ⚠️  ОПАСНОЕ ДЕЙСТВИЕ  ⚠️ ⚠️ ⚠️

Вы собираетесь удалить ВСЕ репозитории модуля:
• Всего репозиториев: ${repositories.value.length}
• Участников с репозиториями: ${new Set(repositories.value.map(r => r.participant?.id || r.event_account_id)).size}

❗ ЭТО ДЕЙСТВИЕ НЕОБРАТИМО
❗ Все репозитории будут УДАЛЕНЫ из Gogs
❗ Все пользователи будут УДАЛЕНЫ из Gogs
❗ Все записи будут УДАЛЕНЫ из базы данных

Для подтверждения введите: "УДАЛИТЬ ${repositories.value.length} РЕПОЗИТОРИЕВ"
  `.trim()
  
  const userInput = prompt(confirmationMessage)
  
  if (userInput === `УДАЛИТЬ ${repositories.value.length} РЕПОЗИТОРИЕВ`) {
    await executeDeleteAllRepositories()
  } else if (userInput !== null) {
    alert('❌ Неправильный код подтверждения. Удаление отменено.')
  }
}

// Выполнение удаления всех репозиториев
const executeDeleteAllRepositories = async () => {
  try {
    deletingAllRepositories.value = true
    
    alert('🔄 Запущено удаление всех репозиториев. Пожалуйста, подождите...')
    
    const result = await RepositoryService.deleteAllRepositories(moduleId)
    
    if (result.success) {
      let message = `✅ ${result.message}\n\n`
      message += `📊 Статистика удаления:\n`
      
      if (result.data?.deletion) {
        const d = result.data.deletion
        message += `   • Всего найдено: ${d.total}\n`
        message += `   • ✅ Удалено репозиториев: ${d.repositories_deleted}\n`
        message += `   • ✅ Удалено пользователей: ${d.users_deleted}\n`
        message += `   • ❌ Ошибок: ${d.errors}\n`
      }
      
      if (result.data?.db_deleted) {
        message += `   • 🗃️ Удалено записей из БД: ${result.data.db_deleted}\n`
      }
      
      alert(message)
      
      // Очищаем локальный список
      repositories.value = []
      await loadParticipantsForSingleRepo()
      
    } else {
      throw new Error(result.message || 'Ошибка удаления')
    }
    
  } catch (error) {
    console.error('❌ Ошибка удаления всех репозиториев:', error)
    alert(`❌ ${error.message || 'Не удалось удалить репозитории'}`)
  } finally {
    deletingAllRepositories.value = false
  }
}

// В script setup добавьте:

const togglingEntireModule = ref(false)

const activateEntireModule = async () => {
  if (!module.value) return
  
  const moduleName = module.value.name || 'модуль'
  const dbCount = databases.value.length
  const repoCount = repositories.value.length
  
  const message = `
🚀 АКТИВИРОВАТЬ ВЕСЬ МОДУЛЬ "${moduleName}"?

📊 Ресурсы модуля:
• Базы данных: ${dbCount} шт.
• Репозитории: ${repoCount} шт.

✅ БУДУТ РАЗБЛОКИРОВАНЫ:
• Все БД (полный доступ)
• Все репозитории (запись и чтение)
• Модуль станет активным

Продолжить?
`.trim()
  
  if (!confirm(message)) return
  
  try {
    togglingEntireModule.value = true
    
    const result = await DatabaseService.toggleAllModuleResources(moduleId, true)
    
    // Обновляем все данные
    await Promise.all([
      loadModule(),
      loadDatabases(),
      loadRepositories()
    ])
    
    // Показываем результат
    let resultMessage = `✅ Модуль активирован!\n\n`
    resultMessage += `📊 Результаты:\n`
    resultMessage += `• БД разблокировано: ${result.data.databases.unlocked}/${result.data.databases.total}\n`
    resultMessage += `• Ошибок при БД: ${result.data.databases.errors}\n`
    resultMessage += `• Репозиториев разблокировано: ${result.data.repositories.updated || 0}\n`
    resultMessage += `• Статус модуля: Активен ✅`
    
    alert(resultMessage)
    
  } catch (error) {
    console.error('❌ Ошибка активации модуля:', error)
    alert(`❌ ${error.message || 'Не удалось активировать модуль'}`)
  } finally {
    togglingEntireModule.value = false
  }
}

const deactivateEntireModule = async () => {
  if (!module.value) return
  
  const moduleName = module.value.name || 'модуль'
  const dbCount = databases.value.length
  const repoCount = repositories.value.length
  
  const message = `
⛔ ОТКЛЮЧИТЬ ВЕСЬ МОДУЛЬ "${moduleName}"?

📊 Ресурсы модуля:
• Базы данных: ${dbCount} шт.
• Репозитории: ${repoCount} шт.

🔒 БУДУТ ЗАБЛОКИРОВАНЫ:
• Все БД (только чтение)
• Все репозитории (только чтение)
• Модуль станет отключенным

⚠️ ВНИМАНИЕ:
• Участники не смогут вносить изменения
• Доступ будет только для просмотра
• Разблокировка потребует действий администратора

Продолжить?
`.trim()
  
  if (!confirm(message)) return
  
  try {
    togglingEntireModule.value = true
    
    const result = await DatabaseService.toggleAllModuleResources(moduleId, false)
    
    // Обновляем все данные
    await Promise.all([
      loadModule(),
      loadDatabases(),
      loadRepositories()
    ])
    
    // Показываем результат
    let resultMessage = `✅ Модуль отключен!\n\n`
    resultMessage += `📊 Результаты:\n`
    resultMessage += `• БД заблокировано: ${result.data.databases.locked}/${result.data.databases.total}\n`
    resultMessage += `• Ошибок при БД: ${result.data.databases.errors}\n`
    resultMessage += `• Репозиториев заблокировано: ${result.data.repositories.updated || 0}\n`
    resultMessage += `• Статус модуля: Отключен ⛔`
    
    alert(resultMessage)
    
  } catch (error) {
    console.error('❌ Ошибка отключения модуля:', error)
    alert(`❌ ${error.message || 'Не удалось отключить модуль'}`)
  } finally {
    togglingEntireModule.value = false
  }
}

// Создать учетные записи экспертов

const createExpertAccounts = async () => {
  if (!confirm('Создать учетные записи в Gogs для всех экспертов модуля?\n\nЭксперты получат доступ ко всем репозиториям участников.')) {
    return
  }
  
  try {
    creatingExpertAccounts.value = true
    
    const result = await ExpertService.createExpertAccounts(moduleId)
    
    let message = `✅ ${result.message}\n\n`
    
    if (result.data) {
      message += `📊 Статистика:\n`
      message += `   • Всего экспертов: ${result.data.total}\n`
      message += `   • ✅ Успешно: ${result.data.successful}\n`
      message += `   • ❌ Ошибок: ${result.data.failed}\n`
    }
    
    alert(message)
    
    // Обновляем список
    await loadModuleExperts()
    
  } catch (error) {
    console.error('❌ Ошибка создания учетных записей экспертов:', error)
    alert(`❌ ${error.message || 'Не удалось создать учетные записи'}`)
  } finally {
    creatingExpertAccounts.value = false
  }
}

const createPublicRepository = async () => {
  if (!confirm('Создать публичный репозиторий для модуля?\n\n📌 Все участники и эксперты смогут просматривать содержимое.\n👑 Только Главный и Технический эксперты смогут вносить изменения.\n✅ Доступ будет настроен автоматически для всех участников мероприятия.')) {
    return
  }
  
  try {
    creatingPublicRepo.value = true
    
    // 1. Создаем публичный репозиторий
    const result = await ExpertService.createPublicRepository(moduleId)
    
    console.log('📦 Результат создания публичного репозитория:', result)
    
    let message = `✅ ${result.message}\n\n`
    message += `🔗 URL: ${result.data?.repository?.url || result.data?.clone_url}\n`
    
    // 2. Проверяем, настроен ли доступ автоматически
    if (result.data?.access_configured) {
      const accessResults = result.data.access_results
      message += `\n👥 Автоматически настроен доступ для:\n`
      
      if (accessResults.by_role) {
        Object.entries(accessResults.by_role).forEach(([roleId, roleData]) => {
          if (roleData.successful > 0) {
            message += `   • ${roleData.role_name}: ${roleData.successful} пользователей\n`
          }
        })
      }
      
      message += `\n📊 Всего: ${accessResults.total_users} пользователей\n`
      message += `✅ Администраторов: ${(accessResults.by_role?.[1]?.successful || 0) + (accessResults.by_role?.[3]?.successful || 0)}\n`
      message += `👀 Наблюдателей: ${(accessResults.by_role?.[2]?.successful || 0) + (accessResults.by_role?.[4]?.successful || 0)}\n`
    } else {
      message += `\n⚠️ Доступ не настроен автоматически\n`
      message += `Для настройки прав используйте кнопку "Настроить доступ" ниже.\n`
    }
    
    alert(message)
    
    // 3. Загружаем обновленную информацию о публичном репозитории
    await loadPublicRepository()
    
  } catch (error) {
    console.error('❌ Ошибка создания публичного репозитория:', error)
    
    let errorMessage = error.message || 'Не удалось создать публичный репозиторий'
    
    // Проверяем, есть ли детали ошибки
    if (error.response?.data?.errors) {
      errorMessage += '\n\nДетали:\n'
      error.response.data.errors.forEach((err, i) => {
        errorMessage += `${i + 1}. ${err}\n`
      })
    }
    
    alert(`❌ ${errorMessage}`)
  } finally {
    creatingPublicRepo.value = false
  }
}

async function handleCreatePublicRepository() {
    try {
        const result = await RepositoryService.createPublicRepository(moduleId)
        
        // Показать сообщение об успехе
        alert(`✅ Публичный репозиторий создан!\n` +
              `🔗 URL: ${result.data.repository.url}\n` +
              (result.data.access_configured 
                  ? `👥 Доступ настроен для ${result.data.access_results.total_users} пользователей`
                  : '⚠️ Доступ не настроен (используется mock режим)'))
        
        // Обновить список репозиториев
        loadPublicRepository()
        
    } catch (error) {
        alert(`❌ Ошибка: ${error.response?.data?.message || error.message}`)
    }
}

// Загрузить информацию о публичном репозитории
const loadPublicRepository = async () => {
  try {
    publicRepoLoading.value = true
    publicRepoError.value = ''
    
    const result = await ExpertService.getPublicRepository(moduleId)
    
    console.log('📦 Данные публичного репозитория:', result)
    
    // Проверяем разные форматы ответа
    if (result && typeof result === 'object') {
      // Если ответ содержит data
      if (result.data) {
        publicRepository.value = result.data
      } 
      // Если ответ уже содержит нужные поля
      else if (result.name || result.url) {
        publicRepository.value = result
      }
      // Если структура с success
      else if (result.success && result.data) {
        publicRepository.value = result.data
      } 
      else {
        publicRepository.value = null
      }
    } else {
      publicRepository.value = null
    }
    
  } catch (error) {
    // Проверяем, если это ошибка 404 (репозиторий не найден)
    if (error.response?.status === 404 || error.message?.includes('404')) {
      console.log('ℹ️ Публичный репозиторий еще не создан')
      publicRepository.value = null
      publicRepoError.value = ''
    } else {
      console.error('❌ Ошибка загрузки публичного репозитория:', error)
      publicRepoError.value = error.message || 'Не удалось загрузить информацию'
    }
  } finally {
    publicRepoLoading.value = false
  }
}

// Вспомогательные функции
const getExpertsByRole = (role) => {
  return experts.value.filter(expert => expert.role === role)
}

const getRoleClass = (role) => {
  const classes = {
    'Главный эксперт': 'role-chief',
    'Технический эксперт': 'role-tech',
    'Эксперт': 'role-expert'
  }
  return classes[role] || 'role-unknown'
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

// При загрузке репозиториев обновляем список участников
watch(repositories, () => {
  loadParticipantsForSingleRepo()
})

// При смене таба загружаем участников
watch(activeTab, (newTab) => {
  if (newTab === 'repositories') {
    loadParticipantsForSingleRepo()
  }
})

onMounted(async () => {
  await Promise.all([
    loadModule(),
    loadModuleStatuses()
  ])
})
</script>

<style scoped>
.module-detail-page {
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8fafc;
}

/* Хлебные крошки */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.breadcrumb-back {
  background: none;
  border: none;
  color: #2E80ED;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.breadcrumb-back:hover {
  background: #e0f2fe;
}

.breadcrumb-link {
  color: #2E80ED;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.breadcrumb-link:hover {
  background: #e0f2fe;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #475569;
  font-weight: 500;
}

/* ===== Стили для вкладки БАЗ ДАННЫХ ===== */
.databases-tab {
  padding: 1.5rem;
}

.bulk-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.delete-all-btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
}

.delete-all-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.4);
}

.delete-all-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.test-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.loading, .error, .empty {
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 12px;
  margin: 1rem 0;
}

/* ===== Стили для ID ячейки ===== */
.id-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

.id-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #3b82f6;
  border: 2px solid #dbeafe;
  min-width: 10px;
  text-align: center;
}

/* ===== Улучшенные стили для ячеек таблицы БД ===== */
td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background 0.2s;
}

td:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

td:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* Стили для ячеек с участниками в таблице БД */


.participant-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.seat-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.loading {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px dashed #7dd3fc;
}

.error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  color: #dc2626;
}

.empty {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.databases-list {
  margin-top: 1.5rem;
}

.stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

thead {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

th {
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
}

td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background 0.2s;
}

tr:hover td {
  background: #f8fafc;
}

.code-highlight {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #1e293b;
  border: 1px solid #cbd5e1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
}

.status-badge.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-badge.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* ===== Анимации ===== */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-dots {
  display: inline-flex;
  gap: 0.25rem;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

/* ===== Адаптивность ===== */
@media (max-width: 768px) {
  .databases-tab {
    padding: 1rem;
  }
  
  .bulk-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .table-container {
    overflow-x: auto;
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  
  th, td {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}

.loading, .error, .empty {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.databases-list {
  margin-top: 1rem;
}

.stats {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

/* Основной заголовок */
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.module-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  word-wrap: break-word;
}

.module-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #64748b;
  font-size: 0.9rem;
}

.module-id {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;
  font-size: 0.95rem;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 150px;
}

.password-display {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.85rem;
  word-break: break-all;
  flex: 1;
  color: black;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #e9ecef;
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.edit-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #9ca3af;
}

.delete-btn {
  background: white;
  color: #dc2626;
  border-color: #fecaca;
}

.delete-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
}

.btn-icon {
  font-size: 1rem;
}

/* Информационная панель */
.info-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Добавьте в стили компонента */
.danger-btn {
  background-color: #dc2626 !important;
  border-color: #dc2626 !important;
  color: white !important;
}

.danger-btn:hover:not(:disabled) {
  background-color: #b91c1c !important;
  border-color: #b91c1c !important;
}

.danger-btn:disabled {
  background-color: #fca5a5 !important;
  border-color: #fca5a5 !important;
  opacity: 0.7;
}

.status-badge.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.status-planned {
  background: #dbeafe;
  color: #1e40af;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-completed {
  background: #f3f4f6;
  color: #374151;
}

.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.event-link {
  color: #2E80ED;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.event-link:hover {
  color: #1E6FD9;
  text-decoration: underline;
}

/* Вкладки */
.tabs {
  display: flex;
  gap: 0.25rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  background: #2E80ED;
  color: white;
  box-shadow: 0 2px 4px rgba(46, 128, 237, 0.2);
}

/* Контент вкладок */
.tab-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  min-height: 400px;
}

/* Вкладка Обзор */
.overview-section {
  margin-bottom: 2.5rem;
}

.overview-section:last-child {
  margin-bottom: 0;
}

.overview-section h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 1.25rem 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #2E80ED;
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.stat-action {
  background: #2E80ED;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.stat-action:hover {
  background: #1E6FD9;
}

/* История активности */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-dot {
  width: 12px;
  height: 12px;
  background: #2E80ED;
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-time {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-text {
  color: #475569;
  font-weight: 500;
}

.activity-placeholder {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

/* Ресурсные вкладки */
.resource-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
}

.add-resource-btn {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-resource-btn:hover {
  background: #1E6FD9;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.empty-hint {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #1E6FD9;
}

/* Стили для вкладки Репозитории */
.repositories-tab {
  padding: 1rem;
}

.bulk-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.test-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.test-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.repositories-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.repositories-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.repositories-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.repositories-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
  transition: background 0.2s;
}

.repositories-table tr:hover td {
  background: #f8fafc;
}

/* Стили для ячейки участника */
.participant-cell-enhanced {
  min-width: 200px;
  max-width: 250px;
}

.participant-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.participant-login {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #475569;
  display: inline-block;
  margin-top: 0.25rem;
}

/* Стили для названия репозитория */
.repo-name-cell {
  min-width: 250px;
}

.repo-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
  display: block;
}

.repo-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.repo-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Стили для статуса репозитория */
.repo-status {
  min-width: 120px;
}

/* Стили для ссылок */
.links-cell-enhanced {
  min-width: 180px;
}

.links-group-enhanced {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-btn-enhanced {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: 1px solid;
  width: 100%;
  justify-content: center;
}

.web-btn {
  border-color: #7dd3fc;
  background: #f0f9ff;
  color: #0369a1;
}

.web-btn:hover {
  background: #e0f2fe;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(7, 89, 133, 0.1);
}

.ssh-btn {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.ssh-btn:hover {
  background: #dcfce7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.1);
}

.http-btn {
  border-color: #fcd34d;
  background: #fefce8;
  color: #92400e;
}

.http-btn:hover {
  background: #fef3c7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(146, 64, 14, 0.1);
}

.links-hint {
  display: block;
  margin-top: 0.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
  text-align: center;
}

/* Стили для действий */
.actions-cell-enhanced {
  min-width: 140px;
}

/* Стили для кнопки пересоздания */
.recreate-btn {
  background: #f59e0b;
  color: white;
}

.recreate-btn:hover:not(:disabled) {
  background: #d97706;
}

.recreate-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.actions-group-enhanced {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}

.action-btn-enhanced {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.action-btn-enhanced:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.access-btn {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
}

.access-btn:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  transform: translateY(-2px);
}

.enable-btn {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.enable-btn:hover {
  background: linear-gradient(135deg, #a7f3d0 0%, #86efac 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.disable-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.disable-btn:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.open-btn {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.open-btn:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.delete-btn {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

/* Статус подключения */
.connection-status {
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.connection-status.connected {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.connection-status.disconnected {
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.status-icon {
  font-size: 1.2rem;
}

.mock-badge {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  margin-left: auto;
}

.connection-details {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

/* Таблица */
.repositories-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

.repositories-table table {
  width: 100%;
  border-collapse: collapse;
}

.repositories-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e2e8f0;
}

.repositories-table td {
  padding: 1rem;
  border-bottom: 1px solid #eef2f7;
  vertical-align: top;
}

.participant-cell {
  min-width: 180px;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.seat-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: inline-block;
  width: fit-content;
}

.login-display {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
}

.repo-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.repo-name {
  color: #1e293b;
  word-break: break-all;
}

.repo-description {
  color: #64748b;
  font-size: 0.9rem;
}

.repo-meta {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Статус баджи */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.disabled {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.error {
  background: #fef2f2;
  color: #991b1b;
}

/* Ссылки */
.links-cell {
  min-width: 180px;
}

.links-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.link-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.link-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.web-btn:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
}

.ssh-btn:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.http-btn:hover {
  background: #fef3c7;
  border-color: #fcd34d;
}

.links-hint {
  display: block;
  margin-top: 0.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Действия */
.actions-cell {
  min-width: 140px;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
}

.actions-group .action-btn {
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  justify-content: center;
  border-radius: 6px;
}

.access-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.access-btn:hover {
  background: #e5e7eb;
}

.enable-btn {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.enable-btn:hover {
  background: #a7f3d0;
}

.disable-btn {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.disable-btn:hover {
  background: #fecaca;
}

.open-btn {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.open-btn:hover {
  background: #bfdbfe;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover {
  background: #fecaca;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;
  margin: 2rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.primary-btn, .secondary-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background: #2E80ED;
  color: white;
}

.primary-btn:hover {
  background: #1E6FD9;
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.secondary-btn:hover {
  background: #e5e7eb;
}

.empty-hint {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #bae6fd;
  color: #0369a1;
  text-align: left;
}

.empty-hint p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

/* Статистика */
.stats-bar {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.table-footer {
  margin-top: 2rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.footer-info p {
  margin: 0.5rem 0;
  color: #0369a1;
  font-size: 0.9rem;
}

/* Состояния загрузки */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  background: #f8fafc;
  border-radius: 8px;
  margin: 2rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2E80ED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Вкладка настроек */
.settings-section {
  margin-bottom: 2.5rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.danger-title {
  color: #dc2626;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #475569;
  font-size: 0.9rem;
}

.readonly-field {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 1rem;
}

.description-field {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* Добавьте эти стили */

/* Стиль для кнопки синхронизации */
.sync-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  font-weight: 600;
}

.sync-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Остальные кнопки */
.test-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* Адаптивность */
@media (max-width: 768px) {
  .bulk-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .bulk-actions button {
    width: 100%;
    justify-content: center;
  }
}

.edit-settings-btn {
  padding: 0.75rem 1.5rem;
  background: #2E80ED;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-settings-btn:hover {
  background: #1E6FD9;
}

.danger-zone {
  background: #fef2f2;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  max-width: 600px;
}

.danger-warning {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.warning-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.warning-content h4 {
  color: #dc2626;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.warning-content p {
  color: #991b1b;
  margin: 0;
  line-height: 1.5;
}

.danger-btn {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.danger-btn:hover {
  background: #b91c1c;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
}

.modal-close:hover {
  color: #374151;
  background: #f3f4f6;
}

.modal-form {
  padding: 1.5rem;
}

.modal-form .form-group {
  margin-bottom: 1.5rem;
}

.modal-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.modal-form input,
.modal-form textarea,
.modal-form select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.modal-form input:focus,
.modal-form textarea:focus,
.modal-form select:focus {
  outline: none;
  border-color: #2E80ED;
  box-shadow: 0 0 0 3px rgba(46, 128, 237, 0.1);
}

.modal-form input:disabled,
.modal-form textarea:disabled,
.modal-form select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.submit-btn {
  background: #2E80ED;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #1E6FD9;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.error-message strong {
  font-weight: 600;
}

/* В стилях компонента добавьте */
.create-single-section {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.create-single-section h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
}

.single-create-form {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.participant-select {
  flex: 1;
  min-width: 250px;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
}

.single-create-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.single-create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.small-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.refresh-btn {
  color: #007bff;
}

.refresh-btn:hover {
  background: #e7f1ff;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background: #f8d7da;
}

.actions-cell {
  min-width: 120px;
  text-align: center;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  width: 100%;
}

.recreate-all-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.recreate-all-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.bulk-management {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.bulk-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.lock-all-btn {
  background-color: #ef4444;
  color: white;
  border: none;
}

.lock-all-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.unlock-all-btn {
  background-color: #10b981;
  color: white;
  border: none;
}

.unlock-all-btn:hover:not(:disabled) {
  background-color: #059669;
}

.bulk-stats {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.stat-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-badge.active {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.stat-badge.locked {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Кнопки в таблице */
.lock-btn {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.lock-btn:hover {
  background-color: #fde68a;
}

.unlock-btn {
  background-color: #d1fae5;
  color: #065f46;
  border-color: #10b981;
}

.unlock-btn:hover {
  background-color: #a7f3d0;
}

/* Индикатор статуса в таблице */
.status-badge.locked {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

/* Разные стили для кнопок создания и пересоздания */
.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.lock-btn {
  background: #f59e0b !important;
  border-color: #f59e0b !important;
  color: white !important;
}

.lock-btn:hover:not(:disabled) {
  background: #d97706 !important;
  border-color: #d97706 !important;
}

.lock-btn:disabled {
  background: #fbbf24 !important;
  border-color: #fbbf24 !important;
  opacity: 0.7;
}


.single-repo-create {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.participant-select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  min-width: 250px;
  font-size: 14px;
}

.participant-select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.single-create-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.single-create-btn:hover:not(:disabled) {
  background: #2563eb;
}

.single-create-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* Стиль для участника с репозиторием */
option[data-has-repo="true"] {
  color: #10b981;
  font-weight: 500;
}



/* Стили для умной кнопки */
.smart-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
}

.smart-btn.create-btn {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.smart-btn.recreate-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.smart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}


/* Стили для вкладки экспертов */
.experts-tab {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.expert-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.create-expert-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.public-repo-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* Стили для ролей */
.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-chief {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.role-tech {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #60a5fa;
}

.role-expert {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #9ca3af;
}

/* Карточка публичного репозитория */
.repo-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.repo-header h5 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.public-badge {
  background: #dcfce7;
  color: #166534;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #86efac;
}

.repo-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.repo-links {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.repo-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Стили для таблицы экспертов */
.expert-name {
  font-weight: 500;
  color: #1f2937;
}

.expert-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.public-repo-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.public-repo-section h4 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.public-repo-info {
  animation: fadeIn 0.3s ease;
}

.repo-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 12px;
  padding: 1.5rem;
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.repo-header h5 {
  margin: 0;
  font-size: 1.25rem;
  color: #0369a1;
  font-weight: 600;
}

.public-badge {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.repo-description {
  color: #475569;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.repo-owner {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #bae6fd;
}

.repo-owner small {
  color: #64748b;
  font-size: 0.875rem;
}

.repo-links {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.repo-links .link-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.95rem;
}

.repo-links .link-btn:first-child {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.repo-links .link-btn:first-child:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.repo-links .link-btn:last-child {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.repo-links .link-btn:last-child:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.repo-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  padding-top: 1rem;
  border-top: 1px dashed #cbd5e1;
}

.repo-meta small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.repo-meta small::before {
  content: "•";
  color: #94a3b8;
}

/* Анимации */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Адаптивность */
@media (max-width: 768px) {
  .public-repo-section {
    padding: 1rem;
  }
  
  .repo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .repo-links {
    flex-direction: column;
  }
  
  .repo-links .link-btn {
    width: 100%;
    justify-content: center;
  }
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Адаптивность */
@media (max-width: 768px) {
  .module-detail-page {
    padding: 1rem;
  }
  
  .header-main {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .info-panel {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    overflow-x: auto;
    padding: 0.25rem;
  }
  
  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .tab-content {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .module-title {
    font-size: 1.5rem;
  }
  
  .module-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .breadcrumb {
    font-size: 0.8rem;
  }
}
</style>
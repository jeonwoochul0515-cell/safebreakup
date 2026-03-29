-- 이별방패 (SafeBreakup) 데이터베이스 스키마
-- Supabase (PostgreSQL) + pgvector

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID 생성 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 사용자 테이블 ───────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  nickname TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 사용자 사건 ─────────────────────────────────────────
CREATE TABLE user_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'assessment', 'evidence', 'analysis', 'options', 'action', 'resolved', 'archived')),
  current_phase SMALLINT NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 5),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  fact_summary JSONB NOT NULL DEFAULT '{}',
  option_a TEXT,
  option_b TEXT,
  selected_option TEXT CHECK (selected_option IN ('A', 'B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_cases_user_id ON user_cases(user_id);
CREATE INDEX idx_user_cases_status ON user_cases(status);

-- ─── 대화 세션 ──────────────────────────────────────────
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES user_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phase SMALLINT NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 5),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_conversations_case_id ON conversations(case_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- ─── 메시지 ─────────────────────────────────────────────
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  phase SMALLINT NOT NULL CHECK (phase BETWEEN 1 AND 5),
  emotion_state TEXT CHECK (emotion_state IN ('crisis', 'distressed', 'anxious', 'calm')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_emotion_state ON messages(emotion_state) WHERE emotion_state = 'crisis';

-- ─── 판례 (벡터 임베딩 포함) ──────────────────────────────
CREATE TABLE court_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT NOT NULL UNIQUE,
  court TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_text TEXT NOT NULL,
  ruling TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_court_cases_category ON court_cases(category);
CREATE INDEX idx_court_cases_keywords ON court_cases USING GIN(keywords);
-- 벡터 유사도 검색을 위한 IVFFlat 인덱스 (데이터 1000건 이상 시 생성 권장)
-- CREATE INDEX idx_court_cases_embedding ON court_cases USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ─── 판례 청크 (RAG용) ──────────────────────────────────
CREATE TABLE case_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_case_id UUID NOT NULL REFERENCES court_cases(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_chunks_court_case_id ON case_chunks(court_case_id);
-- CREATE INDEX idx_case_chunks_embedding ON case_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ─── 법령 ───────────────────────────────────────────────
CREATE TABLE statutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  law_name TEXT NOT NULL,
  article_number TEXT NOT NULL,
  article_title TEXT NOT NULL,
  content TEXT NOT NULL,
  penalty TEXT,
  effective_date DATE NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(law_name, article_number)
);

CREATE INDEX idx_statutes_law_name ON statutes(law_name);
CREATE INDEX idx_statutes_keywords ON statutes USING GIN(keywords);

-- ─── 결제 ───────────────────────────────────────────────
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES user_cases(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW',
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider TEXT NOT NULL CHECK (provider IN ('apple', 'google', 'toss', 'manual')),
  provider_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ─── 변호사 ─────────────────────────────────────────────
CREATE TABLE lawyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  firm TEXT NOT NULL,
  specialization TEXT[] NOT NULL DEFAULT '{}',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Row Level Security (RLS) ───────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "users_own_data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "user_cases_own_data" ON user_cases
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "conversations_own_data" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "messages_own_data" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "payments_own_data" ON payments
  FOR ALL USING (auth.uid() = user_id);

-- 판례, 법령, 변호사 정보는 인증된 사용자에게 읽기 허용
ALTER TABLE court_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "court_cases_read" ON court_cases
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "case_chunks_read" ON case_chunks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "statutes_read" ON statutes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lawyers_read" ON lawyers
  FOR SELECT USING (auth.role() = 'authenticated');

-- ─── updated_at 자동 갱신 트리거 ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_cases_updated_at
  BEFORE UPDATE ON user_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 벡터 유사도 검색 함수 ──────────────────────────────
-- 판례 검색
CREATE OR REPLACE FUNCTION search_court_cases(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  case_number TEXT,
  title TEXT,
  summary TEXT,
  ruling TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.case_number,
    cc.title,
    cc.summary,
    cc.ruling,
    1 - (cc.embedding <=> query_embedding) AS similarity
  FROM court_cases cc
  WHERE 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 법령 검색
CREATE OR REPLACE FUNCTION search_statutes(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  law_name TEXT,
  article_number TEXT,
  article_title TEXT,
  content TEXT,
  penalty TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.law_name,
    s.article_number,
    s.article_title,
    s.content,
    s.penalty,
    1 - (s.embedding <=> query_embedding) AS similarity
  FROM statutes s
  WHERE 1 - (s.embedding <=> query_embedding) > match_threshold
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

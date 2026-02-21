-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "background" TEXT NOT NULL DEFAULT '',
    "education" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "focus" TEXT NOT NULL DEFAULT '',
    "fuel" TEXT NOT NULL DEFAULT '',
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "availableForHire" BOOLEAN NOT NULL DEFAULT true,
    "availableLabel" TEXT NOT NULL DEFAULT 'Open to opportunities',
    "email" TEXT NOT NULL DEFAULT '',
    "github" TEXT NOT NULL DEFAULT 'SleepyLe0',
    "linkedin" TEXT NOT NULL DEFAULT 'kundids-khawmeesri-90814526a',
    "ctaCopy" TEXT NOT NULL DEFAULT 'Let''s build something.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL,
    "projectUsage" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

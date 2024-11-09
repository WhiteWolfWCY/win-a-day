import { Card } from "./ui/card";
import { Trophy, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { AchievementCategory } from "@/db/schema";
import { useTranslations } from 'next-intl';

type AchievementProps = {
  name: string;
  description: string;
  progress: number;
  requirement: number;
  category: AchievementCategory;
  icon: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
};

export function Achievement({ 
  name, 
  description, 
  progress, 
  requirement, 
  category,
  icon,
  xpReward,
  isUnlocked,
  unlockedAt
}: AchievementProps) {
  const t = useTranslations('achievements');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={`p-4 flex items-center gap-4 ${
            isUnlocked 
              ? "bg-background/50 hover:bg-background/70" 
              : "bg-background/30 opacity-50"
          } transition-colors cursor-help`}>
            <div className={`p-2 rounded-full ${
              isUnlocked ? "bg-yellow-500/20" : "bg-muted"
            }`}>
              {icon ? (
                <span className="text-2xl">{icon}</span>
              ) : (
                <Trophy className={`h-6 w-6 ${
                  isUnlocked ? "text-yellow-500" : "text-muted-foreground"
                }`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{name}</h3>
                {!isUnlocked && <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground">{category}</p>
              {!isUnlocked && (
                <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${Math.min((progress / requirement) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="space-y-1">
          <p>{description}</p>
          {isUnlocked ? (
            <>
              <p className="text-sm text-yellow-500">
                {t('unlocked', { xp: xpReward })}
              </p>
              {unlockedAt && (
                <p className="text-xs text-muted-foreground">
                  {t('achievedOn', { 
                    date: unlockedAt.toLocaleDateString(undefined, { 
                      dateStyle: 'medium' 
                    })
                  })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('progress', { current: progress, total: requirement })}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 
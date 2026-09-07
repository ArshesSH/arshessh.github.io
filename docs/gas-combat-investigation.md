# GAS 기반 전투 시스템 코드 조사

조사 일자: 2026-08-28  
조사 대상: `/home/qhunterai/workspace/personal/job/projects/pine-ue-client`의 `feature/game-workflow` 소스  
조사 방법: 아래에 적은 C++/헤더/설정 파일을 읽고, 관련 파일에는 `git log --follow --format='%h|%an|%ad|%s' --date=short -- <파일>`을 실행했다. 콘텐츠의 `.uasset` 바이너리는 소스 코드처럼 해석하지 않았다.

이 문서에서 `확인`은 현재 읽은 소스에서 직접 확인된 사실, `UNKNOWN`은 이 소스 범위만으로 확인할 수 없는 사항이다. 코드 동작에서 한 단계 더 나아간 해석은 `추측`으로 표시한다.

## 요약

| 항목 | 코드에서 확인된 사실 | 포트폴리오 작성 시의 제한 |
|---|---|---|
| ASC 소유/복제 | `ATaekwondoSparringPlayerState`가 ASC와 AttributeSet을 서브오브젝트로 소유하고, ASC 복제 모드는 `Mixed`다. `(Source/Pine/Private/Game/PlayerState/TaekwondoSparringPlayerState.cpp:9-17)` | 폰 교체 시 별도 값 복사 루틴은 확인되지 않았다. PS 소유 구조와 `PossessedBy`/`OnRep_PlayerState` 재연결은 확인된다. 원본 폰 교체 시 실제 값이 reset/중첩되지 않는지는 `UNKNOWN`이다. |
| AttributeSet | `Health`, `MaxHealth`만 복제되고 `Damage`는 비복제 meta attribute다. Damage 적용 후 Health를 차감하고, Health가 0 이하가 되는 순간 `OnDeath` 델리게이트를 방송한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:10-16,32-109)` | 사망을 `GameplayTag`로 기록하는 코드는 확인되지 않았다. |
| 서버 hit | `Server_ReportHit_Implementation`이 CombatData에서 점수 기반 데미지를 계산하고 set-by-caller로 GE를 자기 적용한다. 점수 기록은 GE 적용보다 먼저 호출된다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:376-520)` | `_Validate`의 검증 본문은 주석 처리되어 `true`만 반환한다. 소유권/자기 타격/생존/유효 태그 검증은 현재 C++에서 실효성이 없다. |
| 태그 | HitReaction 이벤트, HitZone Body/Head, 공격 종류/속도, set-by-caller, 결과 이벤트 태그가 정의되어 소비된다. | 유효/무효 타격 태그와 `Blocked` 태그는 C++/기본 태그 설정에서 확인되지 않았다. `bIsBlocked`는 bool이다. |
| Ability | 폰 초기화 코드에 `GiveAbility` 경로가 있고, `TaekwondoAbilityClass`/`HitReactionAbilityClass`가 그 대상이다. 그러나 이 변수에 런타임에서 정확히 어떤 Blueprint/native 클래스가 들어오는지는 `UNKNOWN`이다. | `UTaekwondoAbility`의 `EvaluateCollision()`은 빈 구현이다. 일반 서버 hit 경로는 Ability 활성화가 아니라 GE 직접 적용이다. |
| 절차적 피격 반응 | 서버 컨트롤러가 BodyTracking Pawn의 `NetMulticast, Unreliable` RPC를 호출하고, 각 클라이언트가 `UPineHitReactionComponent`를 구동한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:113-158; Source/Pine/Private/Character/PineBodyTrackingPawn.cpp:108-125)` | AnimGraph/Control Rig 바이너리에서 최종 가산되는 부분은 이 조사에서 확인하지 못했다. C++에서 확인되는 것은 AnimInstance Proxy까지의 전달이다. |
| 저자 | GAS/피격 반응의 주요 파일에는 KIM SAE HYEON 커밋이 다수다. Go Hyeong Ju의 Effect/Collision/HitReaction 보완 커밋도 구분되어 있다. | `git log --follow`의 커밋 저자는 해당 커밋의 변경 저자이지, 현재 모든 줄의 단독 작성자를 의미하지 않는다. |

## 1. AbilitySystemComponent의 소유 위치, 복제와 PlayerState/폰 교체/관전 접근

### 확인된 구조

- `ATaekwondoSparringPlayerState`는 `IAbilitySystemInterface`를 구현하고 `GetAbilitySystemComponent()`을 오버라이드한다. 클래스에는 `UPineAbilitySystemComponent`와 `UPineAttributeSet` 포인터가 각각 멤버로 선언되어 있다. `(Source/Pine/Public/Game/PlayerState/TaekwondoSparringPlayerState.h:19-26,30-48)`
- PlayerState 생성자에서 ASC를 `CreateDefaultSubobject<UPineAbilitySystemComponent>`로 생성하고 `SetIsReplicated(true)`, `SetReplicationMode(EGameplayEffectReplicationMode::Mixed)`를 호출한다. 같은 생성자에서 AttributeSet도 서브오브젝트로 생성한다. `(Source/Pine/Private/Game/PlayerState/TaekwondoSparringPlayerState.cpp:9-17)`
- PlayerState의 `GetAbilitySystemComponent()`은 이 PS의 ASC를 반환한다. `(Source/Pine/Private/Game/PlayerState/TaekwondoSparringPlayerState.cpp:19-22)` 따라서 ASC를 폰이 아닌 PlayerState 소유 구조로 생성한다. 엔진 런타임에서 ASC의 OwnerActor가 최종적으로 어떤 값인지까지는 이 코드만으로 판정할 수 없어 `UNKNOWN`이다.
- 커스텀 ASC인 `UPineAbilitySystemComponent`에는 기본 AttributeEffect를 적용하는 `InitializeDefaultAttributes()`와 `OnAttributeGiven` delegate가 선언되어 있다. `(Source/Pine/Public/AbilitySystem/PineAbilitySystemComponent.h:10-23)`
- 폰도 `IAbilitySystemInterface`를 구현하지만, 폰의 `GetAbilitySystemComponent()`은 현재 PlayerState를 가져와 그 PS의 ASC를 반환한다. PlayerState가 없거나 형변환에 실패하면 `nullptr`다. `(Source/Pine/Public/Character/TaekwondoPawn.h:17-28; Source/Pine/Private/Character/TaekwondoPawn.cpp:50-58)`

### 폰이 PlayerState ASC와 다시 연결되는 경로

- 서버 소유 시 `ATaekwondoPawn::PossessedBy`가 `InitAbilityActorInfo()`를 호출하고, PlayerState 복제 시 `OnRep_PlayerState()`도 같은 초기화를 호출한다. `(Source/Pine/Private/Character/TaekwondoPawn.cpp:60-81)`
- `InitAbilityActorInfo()`는 PS ASC와 AttributeSet을 다시 읽고 `PineAbilitySystemComponent->InitAbilityActorInfo(PS, this)`를 호출한다. 이어서 의존성 바인딩을 하고, authority에서 클래스 기본값과 Ability를 초기화한다. `(Source/Pine/Private/Character/TaekwondoPawn.cpp:103-122)`
- `InitClassDefaults()`는 authority에서 `PineAbilitySystemComponent->InitializeDefaultAttributes(DefaultAttributeEffect)`를 호출한다. 이 함수에는 반복 적용을 막는 중복 가드가 없다. `(Source/Pine/Private/Character/TaekwondoPawn.cpp:191-205)`
- `UPineAbilitySystemComponent::InitializeDefaultAttributes()`는 서버 authority가 아니면 바로 반환하고, authority에서는 지정된 GameplayEffect를 자기 자신에게 적용한다. `(Source/Pine/Private/AbilitySystem/PineAbilitySystemComponent.cpp:13-27)`

### “폰 교체 시 어트리뷰트 유지”의 정확한 판정

- **구조적으로 확인:** AttributeSet과 ASC가 폰에 생성되지 않고 PlayerState에 생성되며, 폰은 현재 PlayerState의 ASC를 참조한다. 따라서 폰 인스턴스가 바뀌어도 같은 PlayerState를 계속 사용하는 경우 재연결할 수 있는 구조다. 근거는 `(Source/Pine/Private/Game/PlayerState/TaekwondoSparringPlayerState.cpp:9-22; Source/Pine/Private/Character/TaekwondoPawn.cpp:50-58,60-81,103-122)`다.
- **명시적인 교체 보장 루틴:** 폰 교체/언포제스 이벤트에서 AttributeSet 값을 복사하거나 이전 ASC를 옮기는 별도 함수는 조사한 소스에서 확인되지 않았다. `UNKNOWN`.
- **주의:** `PossessedBy`/`OnRep_PlayerState`마다 authority의 default attribute effect가 호출될 수 있고, 해당 effect가 기존 값을 덮어쓰는지/중첩하는지는 GE asset 설정에 달려 있다. C++에는 이를 판정하는 코드가 없으므로 실제 값 보존의 전 과정은 `UNKNOWN`이다. 근거는 `(Source/Pine/Private/Character/TaekwondoPawn.cpp:103-122,191-205; Source/Pine/Private/AbilitySystem/PineAbilitySystemComponent.cpp:13-27)`다.

### 관전 PC/HUD에서의 값 접근

- 현재 스파링 HUD 초기화는 PlayerState 쌍을 받아 각 PS를 `ATaekwondoSparringPlayerState`로 캐스팅하고, PS의 ASC와 AttributeSet을 가져온다. Health/MaxHealth 변경 delegate를 ASC에 바인딩하고, 초기 값으로 HealthBar를 갱신한다. `(Source/Pine/Private/UI/PC/SparringHUDUserWidget.cpp:49-93,186-235)`
- `MultiplaySpectatorPawn::CreateCombatHUD()`는 GameState의 combatant pair를 얻어 `USparringHUDUserWidget::Init(P1State,P2State,MultiplayGameState)`를 호출한다. `(Source/Pine/Private/Game/Pawn/MultiplaySpectatorPawn.cpp:280-331; Source/Pine/Private/Game/GameState/MultiplayGameState.cpp:191-219)`
- 다만 관전자 로컬 UI 초기화는 `HasAuthority() && (NetMode == NM_ListenServer || NetMode == NM_Standalone)`일 때만 허용된다. `CreateCombatHUD()` 자체도 authority가 아니면 반환한다. `(Source/Pine/Private/Game/Pawn/MultiplaySpectatorPawn.cpp:257-285)`
- 따라서 **listen server/standalone에서 관전 HUD가 PlayerState의 ASC/AttributeSet을 읽는 코드**는 확인된다. 원격 클라이언트 또는 dedicated server의 관전 PC에서도 같은 HUD가 값에 접근하도록 보장된다는 근거는 없고, 오히려 위 authority gate로 현재 경로가 막힌다. 그 환경의 동작은 `UNKNOWN`이다.
- 구형 `USpectatorHUD`에도 PlayerState를 캐스팅해 AttributeSet을 읽는 `BindHealthBar()`가 있지만, 현재 `MultiplaySpectatorPawn`의 HUD 경로와 동일하게 사용되는지는 `UNKNOWN`이다. `(Source/Pine/Private/UI/Widgets/SpectatorHUD.cpp:83-116; Source/Pine/Private/Game/Pawn/MultiplaySpectatorPawn.cpp:280-331)`

## 2. PineAttributeSet: 어트리뷰트, 복제, Damage meta attribute, clamp와 사망

### 정의와 복제

- `UPineAttributeSet`에는 `Health`와 `MaxHealth`가 `ReplicatedUsing`으로 선언되고, `Damage`는 “not replicated, temporary damage bucket”인 meta attribute로 선언된다. `OnHealthChanged`와 `OnDeath` 델리게이트도 공개되어 있다. `(Source/Pine/Public/AbilitySystem/AttributeSet/PineAttributeSet.h:21-56)`
- `GetLifetimeReplicatedProps()`에서는 `Health`와 `MaxHealth`만 `DOREPLIFETIME_CONDITION_NOTIFY(..., COND_None, REPNOTIFY_Always)`로 등록한다. `Damage`와 `bOutOfHealth`는 이 함수에서 등록되지 않는다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:10-16; Source/Pine/Public/AbilitySystem/AttributeSet/PineAttributeSet.h:45-48,63-72)`

### Clamp

- `PreAttributeChange()`에서 Health는 `0.0f`부터 현재 MaxHealth까지 clamp되고, MaxHealth는 최소 `1.0f`로 clamp된다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:18-30)`
- GameplayEffect가 Damage를 평가한 경우 `PostGameplayEffectExecute()`가 Damage 값을 읽고 즉시 `Damage`를 0으로 되돌린다. Damage가 양수이면 기존 Health에서 Damage를 빼고, `0..MaxHealth`로 clamp한 뒤 Health를 설정하고 `HandleHealthChanged()`를 호출한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:32-51)`
- Health 자체가 직접 평가된 경우에도 old health를 계산해 현재 값을 clamp하고 `HandleHealthChanged()`를 호출한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:53-65)`
- Health와 MaxHealth의 RepNotify 함수는 모두 `HandleHealthChanged()` 경로를 사용한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:67-75)`

### 사망 이벤트의 형태

- `HandleHealthChanged()`는 모든 변화에서 `OnHealthChanged(NewHealth, MaxHealth)`를 방송한다. 새 Health가 양수이면 `bOutOfHealth`를 false로 만들고 반환한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:77-85)`
- 새 Health가 0 이하이고 이미 `bOutOfHealth`가 true이면 다시 방송하지 않는다. 처음 0 이하가 되면 `bOutOfHealth`를 true로 설정하고, OwningActor를 기본 사망 Actor로 삼은 뒤 ASC의 AvatarActor가 있으면 그 Actor로 교체하여 `OnDeath(DeathActor)`를 방송한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:87-109)`
- 현재 C++에서 사망을 내보내는 형태는 `FOnDeath` 델리게이트다. MatchManager는 AttributeSet의 `OnDeath`를 `OnPlayerDown`에 바인딩해 라운드 종료를 처리한다. `(Source/Pine/Public/AbilitySystem/AttributeSet/PineAttributeSet.h:21-22,50-56; Source/Pine/Private/Combat/PineMatchManager.cpp:187-206,553-620)`
- `TAG_State_Dead`는 `State.Dead`로 정의되어 있으나, 조사한 C++에서 이 태그를 추가하거나 검사하는 소비 코드는 확인되지 않았다. `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:26-27)` 죽음이 GameplayTag로도 기록되는지, Blueprint/asset에서 별도 처리되는지는 `UNKNOWN`.
- `ResetHealth()`는 MaxHealth를 설정하고 `bOutOfHealth`를 false로 만든 뒤 Health 변경 delegate를 방송한다. `(Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:111-116)`

## 3. 서버 hit 처리의 실제 경로

### 호출 전 입력 생성

- `UPineCombatCollisionComponent::TickComponent()`는 매 tick `SweepAllHitBoxes()`를 호출한다. `(Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:85-91)`
- 현재 `SweepAllHitBoxes()`의 authority 조건은 주석 처리되어 있고, 새 overlap이면 owner/controller를 찾고 `BuildHitResult()`를 호출한다. `HitResult.bIsBlocked`를 false로 설정한 뒤, 속도가 `LowSpeedThreshold` 이상일 때만 `Server_ReportHit(HitResult)`를 호출한다. 저속 hit는 무시하고, 이미 보고된 overlap은 다시 보고하지 않는다. `(Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:230-309)`
- `BuildHitResult()`는 Attacker를 hitbox owner, Victim을 hurt actor로 채우며, AttackTag는 hitbox의 `BodyPartTag`에서 가져온다. 기본 HitZone은 Body이고, hurtbox/tag/bone/socket/name 검사로 Head를 판정할 수 있다. AttackSpeedTag는 측정 속도를 `ClassifyAttackSpeed()`로 분류하고, spin은 false로 설정한다. `(Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:365-395,397-466)`
- 별도의 `UPineCollisionIKComponent::OnAttackHit()` 경로도 `FPineHitResult`를 만들어 `Server_ReportHit()`을 호출하는 활성 코드가 있다. 반면 `UHitReceiverComponent::OnAttackHit()`의 서버 호출은 주석 처리되어 있다. `(Source/Pine/Private/Components/PineCollisionIKComponent.cpp:588-784; Source/Pine/Private/Components/PineCollisionIKComponent.cpp:144-253)`

### `Server_ReportHit_Implementation`의 순서와 검증

아래는 `Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:376-520`의 현재 구현을 순서대로 요약한 것이다.

1. HitResult의 공격/속도/부위 태그를 로그로 출력한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:376-381)`
2. `HitResult.Victim`을 `APawn`으로 캐스팅하고, `HitResult.Attacker`도 `APawn`으로 캐스팅한다. 어느 쪽이든 실패하면 로그 후 반환한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:383-395)`
3. Victim에 `TestDummy` ActorTag가 있으면 BodyTracking Pawn에 대한 procedural hit reaction helper를 호출하고, **라운드 상태·PS·ASC·데미지·점수 처리 전에 바로 반환**한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:397-402)`
4. GameState를 얻고 MatchState가 `Round`인지 검사한다. Round가 아니면 Victim Pawn이 procedural test mode인지 확인해 그 경우에만 procedural reaction을 호출하고 반환한다. test mode도 아니면 로그 후 반환한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:404-417)`
5. Attacker/Victim PlayerState를 `ATaekwondoSparringPlayerState`로 캐스팅한다. 실패하면 반환한다. 이어 양쪽 ASC를 얻고, 어느 하나라도 없으면 반환한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:419-438)`
6. 데미지 산출에 Victim PS의 `CombatData`를 사용한다. CombatData가 없거나 `DamageEffectClass`가 없으면 반환한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:440-451)`
7. `CombatData->GetDamage(HitResult.AttackTag, HitResult.AttackSpeedTag, HitResult.HitZoneTag, HitResult.bIsSpinAttack)`로 DamageAmount를 계산한다. `DamageAmount <= 0`이면 반환하는 방어 코드는 주석 처리되어 있다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:453-459)`
8. Attacker ASC에서 GameplayEffect context를 만들고 `AddInstigator(AttackerPawn, AttackerController)`를 추가한다. Victim PS의 `DamageEffectClass`로 level 1 outgoing spec을 만든다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:461-471)`
9. 권한 있는 GameMode의 ScoreManager를 얻을 수 있으면 `RecordHit(this, AttackTag, AttackSpeedTag, HitZoneTag, bIsSpinAttack)`를 **데미지 적용 전에** 호출한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:473-478)`
10. `SpecHandle.Data->SetSetByCallerMagnitude(TAG_Damage_SetByCaller, DamageAmount)`를 설정하고, Victim ASC에 `ApplyGameplayEffectSpecToSelf(*SpecHandle.Data.Get())`로 적용한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:480-481)`
11. Victim이 BodyTracking Pawn이면 procedural helper가 실제로 RPC를 호출할 수 있다. 이 호출은 데미지 적용 직후다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:113-158,483)`
12. Victim이 BodyTracking Pawn이 **아닌 경우** EventData를 만들고 `TAG_Gameplay_Event_HitReaction`을 EventTag로 설정한다. Instigator/Target을 설정하고 AttackSpeedTag, AttackTag, HitZoneTag를 TargetTags에 추가한 뒤 Victim ASC의 `HandleGameplayEvent()`를 호출한다. BodyTracking Pawn이면 이 분기를 건너뛴다는 로그를 남긴다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:493-513)`
13. 마지막으로 GameState의 `Multicast_BroadcastHitResult(HitResult)`를 호출한다. 이 함수는 hit 결과 수신 delegate를 방송하는 경로다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:515-520; Source/Pine/Private/Game/GameState/MultiplayGameState.cpp:222-227)`

`Server_ReportHit_Validate()`에는 null attacker/victim, GameState/Round, 실제 조종 Pawn 일치, 자기 타격, 양쪽 Health, AttackTag/HitZone 유효성을 검사하려던 코드가 있으나 전체가 주석 블록 안에 있다. 현재 실행되는 함수 본문은 `return true;`뿐이다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:568-663)`

따라서 현재 활성 경로에서 확인되는 검증은 Pawn/PlayerState/ASC/CombatData/DamageEffectClass 존재 검사, Round 상태 검사, 저속 collision 입력 필터(호출부) 정도다. `bIsBlocked`는 Server_ReportHit에서 검사하지 않으며, self-hit/attacker ownership/dead-health/공격·부위 태그 유효성의 서버 검증은 `UNKNOWN`이 아니라 **현재 C++의 `_Validate`에서는 비활성**이다. `bIsBlocked` 필드와 collision 입력의 false 설정 근거는 `(Source/Pine/Public/Combat/PineHitResult.h:12-53; Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:275-280)`다.

### CombatData에서 점수/데미지 산출

- `UPineCombatData`는 Body/Head 각각에 Low/Medium/High 점수를 담는 구조를 가진다. ScoreTable과 SpinScoreTable, HeadTag, SpinTag, Low/Medium/High speed tag, DamageMultiplier를 DataAsset에 보유한다. `(Source/Pine/Public/Data/PineCombatData.h:10-77)`
- `GetScore()`는 spin이면 SpinScoreTable, 아니면 ScoreTable을 선택하고, `AttackTag.MatchesTag(Pair.Key)`로 공격 행을 찾는다. HitZone이 HeadTag와 매칭되면 Head row, 아니면 Body row를 선택하고, AttackSpeedTag가 High/Medium/Low일 때 각각 해당 점수를 반환한다. 그 외에는 0이다. `(Source/Pine/Private/Data/PineCombatData.cpp:8-34)`
- `GetDamage()`는 `GetScore(...) * DamageMultiplier`이다. `(Source/Pine/Private/Data/PineCombatData.cpp:57-60)` 따라서 현재 코드에서 “데미지”는 별도의 물리식이 아니라 DataAsset 점수 조회 결과에 배율을 곱한 값이다.
- ScoreManager의 `RecordHit()`는 같은 CombatData로 Score를 다시 조회해 round total/counts를 갱신하고, Head zone 및 High speed인 경우 관련 카운트를 갱신한다. `(Source/Pine/Private/Combat/PineScoreManager.cpp:21-70)`

## 4. GameplayTag 정의와 소비

### 실제 정의

| 분류 | 정의된 태그 | 근거 |
|---|---|---|
| 공격 이벤트/부위 | `Combat.Event.Hit`, `Combat.Event.LeftLeg`, `Combat.Event.RightLeg`, `Combat.Event.LeftArm`, `Combat.Event.RightArm` | `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:4-8; Source/Pine/Private/AbilitySystem/PineGameplayTags.h:6-11)` |
| 경기 결과/피격 이벤트 | `Gameplay.Match.Result.Win`, `Gameplay.Match.Result.Lose`, `Gameplay.Event.HitReaction` | `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:10-15; Source/Pine/Private/AbilitySystem/PineGameplayTags.h:13-19)` |
| 부위 | `HitZone.Type.Body`, `HitZone.Type.Head` | `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:13-15; Source/Pine/Private/AbilitySystem/PineGameplayTags.h:17-19)` |
| Ability/set-by-caller | `Ability.Taekwondo.Attack`, `Ability.HitReaction`, `Damage.SetByCaller` | `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:18-24; Source/Pine/Private/AbilitySystem/PineGameplayTags.h:22-30)` |
| 상태/공격 | `State.Dead`, `Attack.Type.Punch`, `Attack.Type.Kick`, `AttackSpeed.Zero/Low/Medium/High` | `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:26-37; Source/Pine/Private/AbilitySystem/PineGameplayTags.h:32-43)` |
| GameplayCue/진영 | `GameplayCue.HitReaction`, `GameplayCue.MatchEnd`, `Faction.Red`, `Faction.Blue` | `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:39-45; Source/Pine/Private/AbilitySystem/PineGameplayTags.h:45-51)` |

`Config/DefaultGameplayTags.ini:14-42`에도 Ability, Attack.Type의 좌/우 변형, AttackSpeed, Combat.Event의 사지 태그, Gameplay.Event.Match.Result 계열, Gameplay.Event.HitReaction, HitZone Body/Head, Player.State 계열이 등록되어 있다. C++의 `Gameplay.Match.Result.Win/Lose`와 설정에 보이는 `Gameplay.Event.Match.Result.*`는 문자열 계층이 같다고 볼 수 없으므로, 두 계열을 동일 태그라고 쓰면 안 된다.

### “유효/무효 타격”, 부위, 상태의 판정

- C++의 `PineGameplayTags` 정의와 `DefaultGameplayTags.ini`에서 `ValidHit`/`InvalidHit`에 해당하는 태그는 확인되지 않았다. `bIsBlocked`는 `FPineHitResult`의 bool이고 collision 코드에서 false로 채워질 뿐, GameplayTag가 아니다. `(Source/Pine/Public/Combat/PineHitResult.h:40-53; Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:275-280)` Blueprint/asset 내부의 별도 유효성 태그는 이 조사 범위에서 `UNKNOWN`.
- 현재 충돌 결과의 부위는 `BuildHitResult()`가 기본 Body로 시작하고, Head tag 또는 bone/socket/name 조건을 만족하면 Head로 바꾼다. `(Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:397-432)` `HitZone.Type.None`은 구형 `HitReceiverComponent` 코드의 입력에만 보이며 그 Server_ReportHit 호출은 주석 처리되어 있고, 해당 None native/config 태그도 확인되지 않는다. `(Source/Pine/Private/Components/PineCollisionIKComponent.cpp:214-253)`
- `HitZone.Type.Body/Head`는 CombatData의 점수 행 선택, ScoreManager의 Head count, HitReactionComponent의 target 선택, HitReactionAbility의 montage 선택에서 소비된다. `(Source/Pine/Private/Data/PineCombatData.cpp:16-30; Source/Pine/Private/Combat/PineScoreManager.cpp:50-55; Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:14-20; Source/Pine/Private/AbilitySystem/Abilities/PineHitReactionAbility.cpp:83-99)`
- `State.Dead`는 정의만 확인되고 C++ 소비는 확인되지 않는다. 실제 사망 처리는 AttributeSet의 `OnDeath` 델리게이트다. `(Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:26-27; Source/Pine/Private/AbilitySystem/AttributeSet/PineAttributeSet.cpp:77-109)`

### 소비 지점

- `Combat.Event.Hit`는 `UTaekwondoAbility` 생성자에서 GameplayEvent trigger로 등록된다. 현재 소스에서 이 태그를 `HandleGameplayEvent()`에 전달하거나 보내는 호출은 확인되지 않았다. `(Source/Pine/Private/AbilitySystem/Abilities/TaekwondoAbility.cpp:12-20)` 따라서 이 trigger가 실제 런타임에 발동하는지는 `UNKNOWN`이다.
- `TAG_Gameplay_Event_HitReaction`은 `Server_ReportHit_Implementation()`의 non-BodyTracking 분기에서 Victim ASC로 전달되고, `UPineHitReactionAbility` 생성자가 같은 태그의 GameplayEvent trigger를 등록한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:493-508; Source/Pine/Private/AbilitySystem/Abilities/PineHitReactionAbility.cpp:10-19)`
- `TAG_Damage_SetByCaller`는 서버 hit 경로의 GameplayEffect spec에 magnitude를 설정하는 데 쓰인다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:465-481)` 이 tag를 읽는 C++ GE 코드는 확인되지 않았고, 실제 GE asset 설정은 `UNKNOWN`이다.
- `Attack.Type.Punch/Kick`과 `AttackSpeed` 태그는 collision/test 입력, CombatData 행 조회, ScoreManager/SFX 등의 자료로 쓰인다. `(Source/Pine/Private/Combat/PineCombatCollisionComponent.cpp:331-395,397-466; Source/Pine/Private/Data/PineCombatData.cpp:8-34; Source/Pine/Private/Combat/PineScoreManager.cpp:21-70)`
- `Gameplay.Match.Result.Win/Lose`는 MatchManager가 각 PlayerState ASC로 보내고, `PineMatchResultAbility`가 GameplayEvent trigger로 받아 승/패 몽타주를 선택한다. `(Source/Pine/Private/Combat/PineMatchManager.cpp:923-1001; Source/Pine/Private/AbilitySystem/Abilities/PineMatchResultAbility.cpp:14-74)`
- `GameplayCue.HitReaction`은 `UPineGameplayCue_HitReaction`의 `GameplayCueTag`로 지정되어 있고 `OnExecute` 구현도 있다. `(Source/Pine/Private/AbilitySystem/GameplayCue/PineGameplayCue_HitReaction.cpp:11-49)` 현재 C++의 hit 경로에서 `ExecuteGameplayCue`/`AddGameplayCue` 호출은 확인되지 않았다. `GameplayCue.MatchEnd`도 이 조사에서 소비 호출을 확인하지 못했다. `UNKNOWN`.

## 5. GameplayAbility 경로의 실제 사용 여부

### UTaekwondoAbility

- `UTaekwondoAbility`는 `UPineDamageAbility`를 상속한다. 생성자는 `InstancedPerActor` 정책을 사용하고 `TAG_Combat_Event_Hit`를 GameplayEvent trigger로 등록한다. `(Source/Pine/Public/AbilitySystem/Abilities/TaekwondoAbility.h:12-39; Source/Pine/Private/AbilitySystem/Abilities/TaekwondoAbility.cpp:12-20)`
- `ActivateAbility()`는 Commit 후 가장 가까운 Pawn을 찾고, 없으면 자기 자신을 test target으로 삼는 로직을 갖는다. `CaptureDamageEffectInfo()`로 얻은 정보를 사용해 source ASC에서 spec을 만들고 target ASC에 직접 적용한다. `(Source/Pine/Private/AbilitySystem/Abilities/TaekwondoAbility.cpp:40-118)` 이 경로는 `Server_ReportHit_Implementation()`의 직접 GE 적용 경로와 별개다. 서버 hit 함수에는 `TryActivateAbility`나 `UTaekwondoAbility::ActivateAbility` 호출이 없고, spec을 직접 만든다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:453-481)`
- `EvaluateCollision()`은 선언되어 있으나 구현 본문이 비어 있다. `(Source/Pine/Public/AbilitySystem/Abilities/TaekwondoAbility.h:23-27; Source/Pine/Private/AbilitySystem/Abilities/TaekwondoAbility.cpp:147-149)`

### UPineDamageAbility

- `UPineDamageAbility`는 DamageEffect와 BaseDamage를 보유한 기반 Ability이고 `CaptureDamageEffectInfo()`가 Level/Avatar/BaseDamage/Effect/Source ASC/Target ASC를 채운다. `(Source/Pine/Public/AbilitySystem/Abilities/PineDamageAbility.h:14-29; Source/Pine/Private/AbilitySystem/Abilities/PineDamageAbility.cpp:10-25)`
- 폰의 `GiveAbility` 코드는 `TaekwondoAbilityClass`를 그대로 `FGameplayAbilitySpec`으로 만들어 `GiveAbility`한다. 하지만 이 변수는 `TSubclassOf<UGameplayAbility>`이므로, 해당 값이 정확히 native `UTaekwondoAbility`인지 Blueprint subclass인지는 코드만으로 확인되지 않는다. `(Source/Pine/Public/Character/TaekwondoPawn.h:33-43; Source/Pine/Private/Character/TaekwondoPawn.cpp:207-229)`
- `UPineDamageAbility` 자체를 직접 `GiveAbility`하는 호출은 조사한 C++에서 확인되지 않았다. 어떤 Blueprint가 이 기반 클래스를 직접 부여하는지는 `UNKNOWN`이다.

### UPineHitReactionAbility

- `UPineHitReactionAbility` 생성자는 `ServerInitiated` 정책으로 `TAG_Gameplay_Event_HitReaction` GameplayEvent trigger를 등록한다. Activate에서는 EventData의 TargetTags에서 Head/Body와 High/Medium/Low를 선택하고, 해당 몽타주를 `PlayMontageAndWait` task로 재생한다. `(Source/Pine/Private/AbilitySystem/Abilities/PineHitReactionAbility.cpp:10-70,83-109)`
- 폰 초기화 시 `HitReactionAbilityClass`가 설정되어 있으면 해당 class를 AbilitySpec으로 만들어 `GiveAbility`한다. `(Source/Pine/Private/Character/TaekwondoPawn.cpp:207-234)` 변수의 실제 기본값이 native `UPineHitReactionAbility` 또는 그 Blueprint subclass인지 소스에서 확인할 수 없으므로 `UNKNOWN`이다.
- 이 Ability가 받은 이벤트를 통해 피격 상태를 설정하는 함수는 BodyTracking Pawn의 visible/ghost mesh AnimInstance를 찾아 `bIsHitReacting`을 설정한다. `(Source/Pine/Private/AbilitySystem/Abilities/PineHitReactionAbility.cpp:111-134)`

### 종합 판정

- `GiveAbility` 호출 자체는 실제로 존재하지만, 세 클래스 중 native class 자체가 어떤 Data/Blueprint 기본값으로 지정되는지는 `UNKNOWN`이다. `(Source/Pine/Private/Character/TaekwondoPawn.cpp:207-245)`
- `UTaekwondoAbility`의 등록 trigger는 현재 C++에서 보내는 이벤트가 확인되지 않아 활성 사용이 `UNKNOWN`이다. `UPineHitReactionAbility`는 non-BodyTracking hit 분기에서 같은 GameplayEvent를 보내는 코드가 확인되지만, 정상 매치가 BodyTracking Pawn을 요구하므로 일반 경기에서 이 분기가 실행되는지는 `추측`으로만 “일반 경로가 아닐 가능성”을 말할 수 있다. 정상 준비 조건 근거는 `(Source/Pine/Private/Game/GameMode/MultiplayGameMode.cpp:822-855)`, 이벤트 송신 근거는 `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:493-508)`이다.
- 현재 정상 BodyTracking 피격 반응의 직접 경로는 Ability가 아니라 `Multicast_StartProceduralHitReaction`이다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:113-158,483; Source/Pine/Private/Character/PineBodyTrackingPawn.cpp:108-125)`

## 6. UPineHitReactionComponent의 절차적 피격 반응

### 입력값, 강도와 시간

- 컴포넌트는 hit zone tag/명시적인 `EPineHitReactionTarget`, hit direction, hit location, explicit strength 및 speed tag/numeric speed를 입력으로 받는 Start 함수들과 Stop/Tick 함수를 제공한다. DataAsset은 `EditDefaultsOnly` 포인터다. `(Source/Pine/Public/Character/Components/PineHitReactionComponent.h:12-41)`
- `ResolveHitReactionTargetFromTag()`는 HitZone이 Head와 매칭되면 Head, 그 외에는 Body를 선택한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:14-20)`
- Start 시 visible mesh가 없거나 direction이 거의 0이면 반환한다. 현재 pose가 활성 중이면 기존 bone offset을 보존해 interrupted start를 이어간다. `ActiveStrength`는 입력 Strength를 `[0.1, 2.0]`으로 clamp한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:49-100)`
- DataAsset에서 target별 HitSpeed/ReturnSpeed와 MaxRotation을 읽고, `ActiveHitDuration = 1 / HitSpeed`, `ActiveReturnDuration = 1 / ReturnSpeed`로 계산한다. 전체 ActiveDuration에는 propagation table의 최대 지연도 더한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:77-100,117-143)`
- numeric hit speed는 `CalculateStrengthFromHitSpeed()`로 강도를 계산한다. RichCurve에 key가 있으면 curve 평가값을 `[0.1,2.0]`으로 clamp하고, 아니면 fallback speed range에서 선형 정규화 후 `EaseExponent`를 적용해 Min/MaxStrength를 선형 보간한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:420-449)` 속도가 0 이하이면 speed 기반 Start를 하지 않는다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:174-200,420-425)`

### 가장 가까운 본과 주변 본 전파

- 시작 시 모든 bone의 socket transform을 `RTS_Component`로 캡처하여 stable transform map을 만든다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:288-318)`
- Body/Head별 candidate bone 목록에서 각 본의 stable component 위치를 world로 변환하고 hit location과의 squared distance가 최소인 본을 선택한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:347-382)`
- DataAsset의 대상별 propagation profile에서 `ImpactOriginBone`과 일치하는 profile을 찾고, 없으면 첫 profile을 사용한다. profile도 없으면 nearest candidate를 origin weight 1.0으로, 나머지 candidate를 weight 0.35로 만들고 index별 delay를 0.02초로 둔다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:384-418)`
- Tick에서는 각 entry의 delay 이전에는 시작 회전을 유지하고, delay 이후 target rotation으로 진입한 다음 return phase에서 identity로 되돌린다. 각 bone의 weighted target과 local offset을 계산해 pose data에 기록한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:218-286)`

### 감쇠/복귀 및 하체 방향 반전

- `EvaluateAlpha()`는 hit phase에서 `EaseOut(2.0)`으로 0→1, return phase에서 `EaseIn(2.0)`으로 1→0을 만든다. 전체 시간이 지나면 0이다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:451-472)`
- base rotation offset은 mesh-local hit direction, rotation/strength, lever arm과 cross-product torque를 이용하고, `OffCenterTorqueBlend`와 선택적 lower-body inversion을 적용한 뒤 bone local offset으로 변환한다. Control Rig가 `CurrentLocal * OffsetLocal`을 적용한다는 설명 주석도 이 함수에 있다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:474-567)`
- lower-body inversion은 Body이고 DataAsset에서 활성화되어 있으며 reference bone이 유효할 때 hit height와 reference height를 비교해 direction을 반전한다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:320-345)`
- Stop은 active pose/maps/stable transforms/inversion을 초기화하고 zero pose를 Proxy에 밀어 넣은 뒤 tick을 끈다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:202-216)`

### Tracking pose 위에 가산되는 AnimInstance Proxy 경로

- 컴포넌트는 visible/ghost mesh의 `UPineAnimInstance`를 찾아 `FPineAnimInstanceProxy& Proxy = AnimInstance->GetBodyTrackingProxyOnGameThread()`를 얻고, `Proxy.ProceduralHitReaction = PoseData`로 기록한다. 직접 AnimInstance의 thread-safe UPROPERTY를 쓰는 방식이 아니다. `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:569-587)`
- `UPineAnimInstance::NativeThreadSafeUpdate()`는 any-thread Proxy를 읽어 `ProceduralHitReaction`과 `bIsHitReacting`을 복사한다. Proxy 구조체에도 동일한 `ProceduralHitReaction` 필드가 있다. `(Source/Pine/Private/Animation/PineAnimInstance.cpp:7-36; Source/Pine/Public/Animation/PineAnimInstance.h:83-91,92-150,161-186)`
- C++ 소스에서 이 값을 최종 AnimGraph/Control Rig 노드가 실제 tracking pose에 가산하는 구현은 확인되지 않았다. 컴포넌트의 `CurrentLocal * OffsetLocal` 주석과 콘텐츠의 Control Rig/AnimBlueprint asset은 존재하지만, asset 내부 연결/최종 적용은 바이너리 분석을 하지 않았으므로 `UNKNOWN`이다. 근거가 되는 코드 전달 경로는 `(Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:474-567,569-587; Source/Pine/Private/Animation/PineAnimInstance.cpp:7-36)`다.

### DataAsset으로 분리된 값

`UPineHitReactionDataAsset` 선언의 C++ 기본값은 다음과 같다. 실제로 `DA_HitReaction.uasset`이 이 값을 그대로 쓰는지 또는 override하는지는 `UNKNOWN`이다. `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:43-135)`

| 값 | C++ 기본값 |
|---|---|
| Body/Head candidate bones | Body: `RootPart1_M`, `RootPart2_M`, `Spine1_M`, `Spine1Part1_M`, `Spine1Part2_M`, `Chest_M`, `Neck_M`; Head: `Neck_M`, `NeckPart1_M`, `NeckPart2_M`, `Head_M` `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:51-68)` |
| Hit/return speed | Body `12.5 / 2.7`; Head `20.0 / 3.7` `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:76-86)` |
| Max rotation | Body `(18,16,10)`; Head `(35,40,24)` `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:88-101)` |
| Torque/vertical | `VerticalPitchScale=0.35`, `OffCenterTorqueBlend=0.45`, `MaxTorqueLeverArm=45` `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:88-101)` |
| 구형 직렬화 호환값 | `LateralHitYawScale=0.65`, `MaxLateralHitYawLeverArm=35`; 현재 `PineHitReactionComponent.cpp`에서 참조되는 것은 확인되지 않았다. `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:103-109)` |
| 하체 반전 | `bInvertLowerBodyDirection=false`, reference bone `Spine1Part1_M` `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:111-117)` |
| speed→strength fallback | RichCurve, fallback speed `50..250`, strength `0.6..1.6`, ease exponent `1.5` `(Source/Pine/Public/Data/PineHitReactionDataAsset.h:119-135)` |

C++ 생성자에 채워지는 Body propagation profile은 다음과 같다. 표기 `Bone:Weight/Delay`는 `(Source/Pine/Private/Data/PineHitReactionDataAsset.cpp:3-90)`의 배열 값이다.

| ImpactOriginBone | propagation entries (Bone:Weight/Delay) |
|---|---|
| `RootPart1_M` | `RootPart1_M:1/0`, `RootPart2_M:.75/.02`, `Spine1_M:.45/.03`, `Spine1Part1_M:.25/.04`, `Spine1Part2_M:.18/.05`, `Chest_M:.12/.06` |
| `RootPart2_M` | `RootPart2_M:1/0`, `RootPart1_M:.45/.02`, `Spine1_M:.75/.02`, `Spine1Part1_M:.45/.03`, `Spine1Part2_M:.25/.04`, `Chest_M:.15/.05` |
| `Spine1_M` | `Spine1_M:1/0`, `Spine1Part1_M:.75/.02`, `RootPart2_M:.40/.03`, `Spine1Part2_M:.45/.03`, `Chest_M:.25/.04`, `Neck_M:.12/.06` |
| `Spine1Part1_M` | `Spine1Part1_M:1/0`, `Spine1_M:.55/.02`, `Spine1Part2_M:.75/.02`, `Chest_M:.40/.03`, `RootPart2_M:.25/.04`, `Neck_M:.18/.05`, `Head_M:.10/.06` |
| `Spine1Part2_M` | `Spine1Part2_M:1/0`, `Chest_M:.75/.02`, `Spine1Part1_M:.55/.02`, `Spine1_M:.35/.03`, `Neck_M:.35/.04`, `Head_M:.18/.06` |
| `Chest_M` | `Chest_M:1/0`, `Spine1Part2_M:.70/.02`, `Spine1Part1_M:.45/.03`, `Spine1_M:.25/.04`, `Neck_M:.45/.03`, `Head_M:.25/.05` |
| `Neck_M` (Body) | `Neck_M:1/0`, `Chest_M:.55/.02`, `Head_M:.45/.02`, `Spine1Part2_M:.35/.04`, `Spine1Part1_M:.18/.05` |

Body profile 배열을 DataAsset에 할당하는 코드도 확인된다. `(Source/Pine/Private/Data/PineHitReactionDataAsset.cpp:82-90)` Head profile은 다음과 같다. `(Source/Pine/Private/Data/PineHitReactionDataAsset.cpp:92-136)`

| ImpactOriginBone | propagation entries (Bone:Weight/Delay) |
|---|---|
| `Head_M` | `Head_M:1/0`, `NeckPart2_M:.80/.01`, `NeckPart1_M:.60/.02`, `Neck_M:.45/.03`, `Chest_M:.28/.05`, `Spine1Part2_M:.12/.06` |
| `NeckPart2_M` | `NeckPart2_M:1/0`, `Head_M:.85/.01`, `NeckPart1_M:.70/.02`, `Neck_M:.45/.03`, `Chest_M:.25/.05` |
| `NeckPart1_M` | `NeckPart1_M:1/0`, `NeckPart2_M:.80/.01`, `Head_M:.65/.02`, `Neck_M:.60/.02`, `Chest_M:.28/.04`, `Spine1Part2_M:.12/.06` |
| `Neck_M` (Head) | `Neck_M:1/0`, `NeckPart1_M:.85/.01`, `NeckPart2_M:.65/.02`, `Head_M:.55/.03`, `Chest_M:.35/.03`, `Spine1Part2_M:.16/.05` |

Head profile 배열 할당은 `(Source/Pine/Private/Data/PineHitReactionDataAsset.cpp:135-136)`이다.

## 7. 절차적 피격 반응의 네트워크 전파와 비-BodyTracking 분기

### 멀티캐스트 경로

- `APineBodyTrackingPawn`에는 `UFUNCTION(NetMulticast, Unreliable) Multicast_StartProceduralHitReaction(FGameplayTag HitZoneTag, FVector HitLocation, FVector HitDirection, float HitSpeed)`가 선언되어 있다. `(Source/Pine/Public/Character/PineBodyTrackingPawn.h:58-62)`
- `MultiplayPlayerController`의 helper는 Victim을 `APineBodyTrackingPawn`으로 캐스팅하고 Attacker가 없으면 반환한다. HitLocation/Direction을 보정한 뒤, report controller의 debug 조건에 따라 debug draw를 하고 Victim의 multicast RPC를 호출한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:113-158)`
- RPC 구현은 local control/test 조건을 확인한다. 정상 local controlled가 아니거나 test 조건이 허용되면 Victim Pawn의 `HitReactionComponent->StartHitReactionFromHitSpeedFromTags(...)`를 호출한다. `(Source/Pine/Private/Character/PineBodyTrackingPawn.cpp:108-125)` 컴포넌트는 BeginPlay에서 visible/ghost mesh를 전달받아 초기화된다. `(Source/Pine/Private/Character/PineBodyTrackingPawn.cpp:59-84)`
- 서버 hit 함수는 데미지 적용 뒤 이 helper를 항상 호출한다. BodyTracking Pawn이 아니면 helper 내부 cast에서 반환한다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:480-483,113-158)`

### BodyTracking Pawn이 아닌 경우

- `Server_ReportHit_Implementation()`은 BodyTracking Pawn이 아닌 Victim에 대해 `TAG_Gameplay_Event_HitReaction` GameplayEvent를 ASC로 보낸다. EventData에는 Instigator/Target과 공격 속도/종류/부위 태그가 들어간다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:493-508)`
- `UPineHitReactionAbility`는 이 GameplayEvent를 trigger로 받고, Head/Body 및 speed tag로 몽타주를 선택해 `PlayMontageAndWait`를 실행한다. `(Source/Pine/Private/AbilitySystem/Abilities/PineHitReactionAbility.cpp:10-19,21-70,83-109)` 그러므로 **현재 C++에 살아 있는 비-BodyTracking fallback은 GameplayEvent→GameplayAbility→몽타주 경로**다.
- 다만 정상 경기 준비 조건은 `APineBodyTrackingPawn`을 요구한다. `(Source/Pine/Private/Game/GameMode/MultiplayGameMode.cpp:822-855)` 실제 경기에서 non-BodyTracking 분기가 일반적으로 도달하지 않는다는 말은 이 조건에 근거한 `추측`이며, 테스트/외부 호출/잘못된 Pawn 상태를 통한 도달 가능성은 코드상 배제되지 않는다.

### GameplayCue와 직접 몽타주 RPC의 현재 연결

- `UPineGameplayCue_HitReaction`은 `GameplayCue.HitReaction`을 태그로 등록하고 `OnExecute()`에서 Head/High/Medium 태그로 몽타주를 고른다. `PlayHitReaction()`은 현재 Round인지 확인하고 Victim을 BodyTracking Pawn으로 캐스팅한다. 비-BodyTracking이면 경고 후 반환하며, local controlled이면 반환한다. `(Source/Pine/Private/AbilitySystem/GameplayCue/PineGameplayCue_HitReaction.cpp:11-124)`
- 조사한 C++ hit 경로에서 `ExecuteGameplayCue`나 `AddGameplayCue`를 호출하는 코드는 확인되지 않았다. `GameplayCue.HitReaction`의 정의/클래스 구현은 살아 있지만, 현재 Server_ReportHit 경로에 연결되었다고 확인할 근거는 없다. `UNKNOWN`.
- BodyTracking Pawn에는 별도의 `PlayNetworkMontage()`와 `Server_PlayMontage`/`Multicast_PlayMontage` 구현이 있다. `(Source/Pine/Private/Character/PineBodyTrackingPawn.cpp:628-645,708-726)` 그러나 조사한 hit 처리 경로에서 이 직접 몽타주 RPC를 호출하는 코드는 확인되지 않았다. 현재 procedural RPC의 대체 경로로 사용된다는 주장은 `UNKNOWN`이다.

## 8. `git log --follow` 저자 구분

아래 표는 각 항목의 핵심 파일에 대해 `git log --follow`로 확인한 **주요 커밋**을 요약한 것이다. 긴 merge/maintenance 이력은 생략했다. 표의 KIM SAE HYEON은 후보자 작업, Go Hyeong Ju와 JunHee Chang은 다른 저자 작업으로 분리했다. 커밋 저자는 해당 커밋의 변경 저자이며 현재 줄 전체의 단독 저자라는 뜻은 아니다.

| 조사 항목 / 핵심 파일 | KIM SAE HYEON 주요 커밋 | 다른 저자 주요 커밋 | 이력에서 확인되는 구분 |
|---|---|---|---|
| 1. PS ASC/복제: `TaekwondoSparringPlayerState.h/.cpp`, `PineAbilitySystemComponent.h/.cpp` | `8e9afca` (2026-06-25, add GAS system), `0316c40` (2026-06-18, start GAS) | 확인된 주요 커밋 없음 | PS/ASC의 GAS 골격은 KIM 커밋이다. |
| 1. 폰 재연결/관전 접근: `TaekwondoPawn.cpp`, `MultiplaySpectatorPawn.cpp`, `SparringHUDUserWidget.cpp` | `90bb939`, `626c0a0`, `b17b0bf`, `58313eb`, `749d512`, `a6fd08b`, `9a0270b` | `84383af`, `779fece` (Go Hyeong Ju), `086e74c` (JunHee Chang) | PS/ASC 재연결 및 현재 spectator HUD 관련 주요 변경은 KIM 이력이고, VR UI/일부 spectator 이력에는 Go/JunHee 커밋이 있다. |
| 2. AttributeSet: `PineAttributeSet.h/.cpp` | `a2decc8` (fix on player down), `a76b8b7` (match result infrastructure), `8e9afca`, `8a34178`, `0316c40` | 주요 커밋 없음 | Attribute/사망 처리 이력은 KIM 중심이다. |
| 3. 서버 hit: `MultiplayPlayerController.cpp/.h` | `90bb939`, `97a675e`, `626c0a0`, `f022c01`, `7c91573` 및 이전 GAS 커밋 | `45779a5` (2026-07-15, Add Effect System), `84383af`, `779fece` (Go Hyeong Ju) | 서버 GE/점수/라운드 흐름은 KIM 커밋이 주도하고 Effect System 보완에 Go 커밋이 있다. |
| 3. 데미지/점수: `PineCombatData.cpp/.h`, `PineScoreManager.cpp/.h` | `749d512`, `8e9afca`, `e6de319`, `bb53fd4`, `7c91573` | `742d235` (fix Speed Damage at Zero Speed), `0eca549` (fix null PlayerState; Go Hyeong Ju) | 기본 CombatData/Score 흐름은 KIM, zero-speed 및 null PS 보완 커밋은 Go다. |
| 3. 충돌 입력: `PineCombatCollisionComponent.cpp/.h` | `1408027`, `23accde`, `d078289`, `8bc51a5`, `8e9afca` | `4ae05b9`, `d4f57a3`, `5d7d8dc` (Go Hyeong Ju) | 최근 procedural/GAS 연결은 KIM, 초기 collision/blocking/game-state 연결은 Go 커밋이 확인된다. |
| 4. GameplayTags: `PineGameplayTags.cpp/.h` | `8e9afca`, `a76b8b7`, `106c024`, `7c91573` | `3f334ea` (Improve Hit Reaction tags/validation), `45779a5` (Add Effect System) (Go Hyeong Ju) | 기본 GAS/결과/mandatory hit tag는 KIM, hit reaction tag/effect 보완에 Go 커밋이 있다. |
| 5. Abilities: `TaekwondoAbility`, `PineDamageAbility`, `PineHitReactionAbility` | `8e9afca`, `8a34178`, `106c024` | 주요 커밋 없음 | 세 Ability 계층과 mandatory hit reaction Ability 이력은 KIM 중심이다. |
| 6. 절차적 반응: `PineHitReactionComponent.cpp/.h`, `PineHitReactionDataAsset.cpp/.h` | `23accde`, `13f9233`, `50ec61c`, `8977ad8`, `25634c8`, `3bc4cd7`, `1408027` | `45b70fb` (UPROPERTY/GC), `8296506` (Test Effect), `45779a5` (Add Effect System) (Go Hyeong Ju) | 절차 반응 알고리즘/데이터 분리는 KIM, UPROPERTY/테스트/Effect 연계 보완은 Go다. |
| 7. 네트워크 반응: `PineBodyTrackingPawn.cpp/.h`, `MultiplayPlayerController.cpp` | `b3d9b8f`, `90bb939`, `6b6d0a7`, `91bec38`, `23accde` | `cd8fd08`, `66b31a8`, `45779a5`, `8296506` (Go Hyeong Ju) | 최근 RPC/procedural 흐름은 KIM, block/effect/test 보완은 Go다. |
| 7. Cue: `PineGameplayCue_HitReaction.cpp/.h` | `64b5d1c`, `ec0b573`, `f52165f`, `8bc51a5`, `8e9afca` | 주요 커밋 없음 | Cue 구현 이력은 KIM 중심이나, 현재 hit 경로 호출은 별도 확인되지 않는다. |

### 저자 이력의 해석 범위

- `PineAttributeSet`, PlayerState ASC, Taekwondo/HitReaction Ability, 절차적 반응 DataAsset/Component의 핵심 추가 및 최근 refactor에는 KIM SAE HYEON 커밋이 반복된다. 근거는 위 표의 commit hash와 각 파일의 `--follow` 이력이다.
- Go Hyeong Ju는 `Add Effect System`, hit reaction tag/validation, collision/blocking, UPROPERTY/GC, zero-speed damage 및 null PlayerState 보완 커밋에 나타난다. 따라서 “GAS 기반 전투 시스템 전체를 한 사람이 작성했다”고 쓰는 것은 이 이력과 맞지 않으며, 적어도 위 표의 영역별 기여를 구분해 쓰는 것이 사실에 맞다.
- 커밋별 상세 diff 없이 현재 각 줄을 저자별로 단정하는 것은 `추측`이다. 이 문서는 `git log --follow`의 주요 커밋 저자만 확인한 결과다.

## 포트폴리오 문장으로 옮길 때 안전한 사실 범위

- “PlayerState에 ASC/AttributeSet을 두고 ASC를 Mixed replication mode로 설정했다”는 문장은 직접 근거가 있다. `(Source/Pine/Private/Game/PlayerState/TaekwondoSparringPlayerState.cpp:9-17)`
- “서버 hit에서 CombatData의 점수표와 set-by-caller GameplayEffect를 사용한다”는 문장은 직접 근거가 있다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:440-481; Source/Pine/Private/Data/PineCombatData.cpp:8-60)`
- “BodyTracking Pawn에는 멀티캐스트 기반 절차적 hit reaction이 있고, body/head closest bone 및 propagation/감쇠 계산을 수행한다”는 문장은 C++ 근거가 있다. `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:113-158; Source/Pine/Private/Character/Components/PineHitReactionComponent.cpp:218-449)`
- “GameplayAbility가 모든 피격을 처리한다”, “사망을 GameplayTag로 동기화한다”, “모든 관전 클라이언트가 PS AttributeSet을 읽는다”, “GameplayCue가 현재 hit 경로에서 호출된다”는 문장은 현재 조사한 소스만으로 확인되지 않으므로 그대로 쓰면 안 된다. 각 제한의 근거는 `(Source/Pine/Private/Game/PlayerController/MultiplayPlayerController.cpp:453-481,493-508; Source/Pine/Private/AbilitySystem/PineGameplayTags.cpp:26-27; Source/Pine/Private/Game/Pawn/MultiplaySpectatorPawn.cpp:257-285; Source/Pine/Private/AbilitySystem/GameplayCue/PineGameplayCue_HitReaction.cpp:11-49)`다.

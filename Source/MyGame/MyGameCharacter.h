#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "MyGameCharacter.generated.h"

UCLASS(config=Game)
class MYGAME_API AMyGameCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AMyGameCharacter();

protected:
	virtual void BeginPlay() override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

public:
	virtual void Tick(float DeltaTime) override;
};

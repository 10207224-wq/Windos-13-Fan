#include "MyGameCharacter.h"

AMyGameCharacter::AMyGameCharacter()
{
	PrimaryActorTick.bCanEverTick = true;
}

void AMyGameCharacter::BeginPlay()
{
	Super::BeginPlay();
}

void AMyGameCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
}

void AMyGameCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);
}

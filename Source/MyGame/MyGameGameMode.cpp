#include "MyGameGameMode.h"
#include "MyGameCharacter.h"
#include "UObject/ConstructorHelpers.h"

AMyGameGameMode::AMyGameGameMode()
{
	DefaultPawnClass = AMyGameCharacter::StaticClass();
}

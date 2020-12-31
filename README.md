# Ship engine power plant
simulation of a ship engine power plant


| Statements                  | Branches                | Functions                 | Lines                |
| --------------------------- | ----------------------- | ------------------------- | -------------------- |
| ![Statements](https://img.shields.io/badge/Coverage-99.78%25-brightgreen.svg) | ![Branches](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg) | ![Functions](https://img.shields.io/badge/Coverage-98.9%25-brightgreen.svg) | ![Lines](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)    |

## Power systems
### Switchboard
```
Diesel generator 1 -->  Breaker Diesel Gen 1
                                  |               ShoreBreaker --<-- Shore
                                  |                |                          |-<--- Emergency generator
==== PROVIDERS  ===============================================================
                        |                     | (switch)
                   MainBreaker1               |
                        |                   Emergency Bus
                        |
                    MainBus1
                        |
```
### Diesel generator 1
```
-- (Diesel service tank) ----------->-- Diesel oil intake valve
-- (Emergency start air receiver) -->-- Start air intake valve
-- (Lubrication service tank) ------>-- Lubrication intake valve
```


## Fuel system

### Diesel oil
```
Shore Valve --> (intake valve) DsStorage (outlet valve) --> (intake valve) DsService (outlet valve)
                                (drain)                                     (drain)
```

### Todo Heavy Fuel


## Compressed Air system
### Start Air
```
Start air compressor 1 - outlet valve  ------ (intake valve) Start air receiver 1 (outlet valve)
                                                              (drain)
                                                              
Emergency compressor - outlet valve  ------ (intake valve) Emergence receiver (outlet valve)
                                                              (drain)
```

### (Todo) Service Air


## Cooling systems
### Sea water cooling circuit 
```
                                         |- Suction pump 1 (main bus) --|     |- Fresh water cooler Diesel generator 1 (aux capable) ->-|
Sea chest high  - suction Valve ->-|     |- Suction pump 2 (main bus) --|==>==|- Fresh water cooler Diesel generator 2 (aux capable) ->-|==>== over board dump valve
                                   |==>==|- Aux pump (emergency bus)----|     |- Steam condenser (cannot work not on aux pump) ------->-|
Sea chest low  - suction valve -> -|
```

### Fresh water cooling circuits
                                                    Fresh water Expand tank
                                                    |
      |->- Fresh water cooler Diesel generator 1 ->-|
      |                                             |
      |-<- Lubrication cooler diesel generator 1 -<
```


## (Todo) Steam system


## (Todo) Engine

# Season Performance data-boundary rules

Season Performance introduces a distinction between metrics that can safely aggregate raw events and metrics that derive sequences.

## Raw-event metrics

Raw-event metrics may combine selected fixture event arrays and then apply the existing Gold event predicate. Examples include passes, touches, shots, tackles and recoveries.

## Derived-sequence metrics

Derived sequences must be built inside a fixture boundary before aggregation. Carries are the first protected family. Future pass chains, transitions and possessions should follow the same rule unless their authoritative definition explicitly says otherwise.

## Identity

Player IDs remain provider IDs. Player display names are rebuilt from the selected fixture dictionaries. The V1 page is Leeds-only by design; opponent events remain in the loaded source because some Gold reconstruction rules require them for continuity and companion-event logic.

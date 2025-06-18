import { CellType } from "src/shared/enums";
import type { Position } from "src/shared/types";

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];  // вверх, вниз, влево, вправо

const NEIGHBORS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

type PositionString = string & {
  __brand: "position"
};

export class BacktrackSolver {
  private grid: CellType[][];

  private row_constraints: number[]

  private col_constraints: number[]

  private rows: number;

  private cols: number;

  private trees: Position[] = [];

  private tents: Set<PositionString> = new Set();

  private links = {
    false: new Set<PositionString>(),
    true: new Set<PositionString>(),
  }

  private getPositionString = (pos: Position): PositionString => {
    return `${pos.row},${pos.column}` as PositionString;
  }

  private parsePositionString = (pos: PositionString): Position => {
    const [row, column] = pos.split(",").map(Number);

    return { row, column }
  }

  constructor (grid: CellType[][], row_constraints: number[], col_constraints: number[]) {
      this.grid = grid;
      this.rows = grid.length;
      this.cols = grid[0].length;
      this.row_constraints = row_constraints.slice();
      this.col_constraints = col_constraints.slice();
      for (let row = 0; row < this.rows; ++row) {
        for (let column = 0; column < this.cols; ++column) {
          if (grid[row][column] === CellType.Tree) {
            this.trees.push({ row, column });
          }
        }
      }

      this.links.false = new Set(this.trees.map(this.getPositionString));
    }

  is_valid_cell(r: number, c: number) {
      return 0 <= r && r < this.rows && 0 <= c && c < this.cols
  }

  get_candidates(tree: Position) {
    const { row: r, column: c } = tree;

    const candidates = DIRS.reduce<Position[]>((acc, [dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;

      if (!this.is_valid_cell(nr, nc)) {
        return acc;
      }
      if (this.grid[nr][nc] !== CellType.Empty) {
        return acc;
      }
      if (this.row_constraints[nr] <= 0 || this.col_constraints[nc] <= 0) {
        return acc;
      }
      if (
        NEIGHBORS.some(([dr2, dc2]) => {
          return this.tents.has(
            this.getPositionString({ row: nr + dr2, column: nc + dc2 }),
          );
        })
      ) {
        return acc;
      }

      acc.push({ row: nr, column: nc });

      return acc;
    }, []);

    return candidates
  }

  place_tent(pos: Position, tree: Position) {
      this.links.false.delete(this.getPositionString(tree));
      this.links.true.add(this.getPositionString(tree));

      const { row: x, column: y } = pos;

      this.tents.add(this.getPositionString(pos));
      this.grid[x][y] = CellType.Tent;
      this.row_constraints[x] -= 1;
      this.col_constraints[y] -= 1;

      NEIGHBORS.forEach(([dr, dc]) => {
        const nr = x + dr;
        const nc = y + dc;

        if (this.is_valid_cell(nr, nc) && this.grid[nr][nc] === CellType.Empty) {
          this.grid[nr][nc] = CellType.Grass;
        }
      });
  }

  remove_tent(pos: Position, tree: Position) {
    this.links.true.delete(this.getPositionString(tree));
    this.links.false.add(this.getPositionString(tree));

    const { row: x, column: y } = pos;

    this.tents.delete(this.getPositionString(pos));

    this.grid[x][y] = CellType.Empty
    this.row_constraints[x] += 1
    this.col_constraints[y] += 1

    NEIGHBORS.forEach(([dr, dc]) => {
      const nr = x + dr;
      const nc = y + dc;

      if (this.is_valid_cell(nr, nc) && this.grid[nr][nc] === CellType.Grass) {
        this.grid[nr][nc] = CellType.Empty;
      }
    });
  }

  solve() {
    if (this._backtrack()) {
      return Array.from(this.tents).map(this.parsePositionString);
    }
  }

  _backtrack() {
    if (this.links.false.size === 0) {
      return true;
    }
    const remaining = Array.from(this.links.false).map(this.parsePositionString);

    const candidates_map = remaining.reduce((acc, tree) => {
      acc.set(
        this.getPositionString(tree),
        this.get_candidates(tree),
      );

      return acc;
    }, new Map<PositionString, Position[]>);

    const sorted_trees = remaining.sort((tree1, tree2) => {
      const length1 = candidates_map.get(
        this.getPositionString(tree1),
      )?.length ?? 0;
      const length2 = candidates_map.get(
        this.getPositionString(tree2),
      )?.length ?? 0;

      return length1 - length2;
    });

    const tree = sorted_trees[0];
    const candidates = candidates_map.get(this.getPositionString(tree));

    if (!candidates) {
        return false;
    }

    for (const pos of candidates) {
      this.place_tent(pos, tree)
      if (this._backtrack()) {
        return true;
      }
      this.remove_tent(pos, tree);
    }

    return false;
  }
}
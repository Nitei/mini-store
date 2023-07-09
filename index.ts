import { BehaviorSubject, filter, first, of, skip } from 'rxjs';

/*****************************************************************
 * Engine
 */

const registerKey = <Value, Key>(value: Value, key: Key) => {
  const dataOfObj = value;
  const _behaviorSubject = new BehaviorSubject<Value>(dataOfObj);

  return {
    name: key,
    _behaviorSubject,
    set: (newValue: Value) => {
      _behaviorSubject.next(newValue);
    },
    get$: () => _behaviorSubject.pipe(skip(1)),
    snapshot: () => _behaviorSubject.getValue(),
    whenReady$: () => {
      const result = _behaviorSubject.getValue();

      if (result !== undefined) {
        return of(result).pipe(first());
      }
      return _behaviorSubject.pipe(skip(1), filter(a => a !== undefined ? true : false), first())
    }
  }
};

const storeGetValues = <Obj>(obj: Obj) => {
  const result = {} as any;
  for(let key in obj) {
    const value = obj[key] as ReturnType<typeof registerKey<Obj[typeof key], typeof key>>;

    result[key] = value.snapshot()
  }
  return result as {[prop in keyof Obj]: Obj[prop]};
}

const createStore = <Obj>(data:Obj) => {
  let store = {
    key: {} as { [prop in keyof Obj]: ReturnType<typeof registerKey<Obj[prop], prop>> },
      getValues() { 
        return storeGetValues<Obj>(this.key)
    }
  };
  for (let name in data) {
    const value = data[name];

    store.key[name] = {} as any;
    store.key[name] = registerKey<typeof value, typeof name>(value, name);
  }
  return store;
};

/*****************************************************************
 * Init
 */

const example = {
  name: 'Jorge',
  age: 12,
};

const store = createStore<typeof example>(example);

/*****************************************************************
 * Logs
 */

// console.log(store.getValues());

// console.log(store.key.name.snapshot());

// store.key.age.set(44)

store.key.age.whenReady$().subscribe(a => {
  console.log(a)
})

